import { copyFile, cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'

const webDistUrl = new URL('../apps/web/dist/', import.meta.url)
const clientDistUrl = new URL('../apps/web/dist/client/', import.meta.url)

// 保留 dist 根目录供 Cloudflare Pages 使用，同时为 Sites 生成 vinext 约定的静态目录。
await mkdir(clientDistUrl, { recursive: true })
for (const path of ['index.html', 'assets', '_headers', '_routes.json', 'robots.txt', 'sitemap.xml']) {
  await cp(new URL(path, webDistUrl), new URL(path, clientDistUrl), { recursive: true })
}

// Sites 的静态层会覆盖缓存头，因此让字体经 Worker 虚拟路径返回。
const clientAssetsUrl = new URL('assets/', clientDistUrl)
for (const fileName of await readdir(clientAssetsUrl)) {
  if (!fileName.endsWith('.css')) continue
  const cssUrl = new URL(fileName, clientAssetsUrl)
  const css = await readFile(cssUrl, 'utf8')
  await writeFile(cssUrl, css.replaceAll('/assets/HarmonyOS_Sans_SC_', '/fonts/HarmonyOS_Sans_SC_'), 'utf8')
}

// Sites 使用 Cloudflare Workers 入口转发同一份 Vite 静态成品。
const worker = `export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url)
    const pathname = requestUrl.pathname

    // 字体文件名包含内容哈希，可安全设置一年不可变缓存。
    if (pathname.startsWith('/fonts/') && pathname.endsWith('.woff2')) {
      requestUrl.pathname = pathname.replace('/fonts/', '/assets/')
      const response = await env.ASSETS.fetch(new Request(requestUrl, request))
      const headers = new Headers(response.headers)
      headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    }

    return env.ASSETS.fetch(request)
  },
}
`

await mkdir(new URL('../apps/web/dist/server/', import.meta.url), { recursive: true })
await writeFile(new URL('../apps/web/dist/server/index.js', import.meta.url), worker, 'utf8')

// 云端从源码构建时也必须在产物内携带站点项目标识。
await mkdir(new URL('../apps/web/dist/.openai/', import.meta.url), { recursive: true })
await copyFile(
  new URL('../apps/web/.openai/hosting.json', import.meta.url),
  new URL('../apps/web/dist/.openai/hosting.json', import.meta.url),
)
