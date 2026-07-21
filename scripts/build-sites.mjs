import { copyFile, mkdir, writeFile } from 'node:fs/promises'

// Sites 使用 Cloudflare Workers 入口转发同一份 Vite 静态成品。
const worker = `export default {
  async fetch(request, env) {
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
