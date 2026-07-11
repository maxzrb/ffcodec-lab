import { mkdir, writeFile } from 'node:fs/promises'

// Sites 使用 Cloudflare Workers 入口转发同一份 Vite 静态成品。
const worker = `export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request)
  },
}
`

await mkdir(new URL('../dist/server/', import.meta.url), { recursive: true })
await writeFile(new URL('../dist/server/index.js', import.meta.url), worker, 'utf8')
