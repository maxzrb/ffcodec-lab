import { cp, mkdir, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const source = fileURLToPath(new URL('../apps/web/dist/', import.meta.url))
const target = fileURLToPath(new URL('../dist/', import.meta.url))

// 兼容 Cloudflare Pages 迁移前的根目录输出契约，避免旧哈希资源残留。
await rm(target, { recursive: true, force: true })
await mkdir(target, { recursive: true })
await cp(source, target, { recursive: true })
