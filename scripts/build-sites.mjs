import { copyFile, mkdir, writeFile } from 'node:fs/promises'

// Sites 使用 Cloudflare Workers 入口转发同一份 Vite 静态成品。
const worker = `export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request)
    const pathname = new URL(request.url).pathname

    // 字体文件名包含内容哈希，可安全设置一年不可变缓存。
    if (pathname.startsWith('/assets/') && pathname.endsWith('.woff2')) {
      const headers = new Headers(response.headers)
      headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    }

    return response
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
