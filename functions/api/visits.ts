// ============================================================
// GET /api/visits — 今日访问量 + 历史总访问量
// GET /api/visits?count=false — 只读查询，不递增
// 仅允许来自本站或本地开发的请求，拒绝外部直接访问
// 使用 Cloudflare Pages Functions + KV 存储
// ============================================================

interface Env {
  VISIT_COUNTER: KVNamespace
}

const ALLOWED_ORIGINS = [
  'https://fflab.loliland.cn',
  'http://localhost:5173',
  'http://localhost:4173',
]

function todayKey(): string {
  const now = new Date()
  const offset = 8 * 60
  const local = new Date(now.getTime() + (now.getTimezoneOffset() + offset) * 60000)
  return local.toISOString().slice(0, 10)
}

function isAllowed(request: Request): boolean {
  const origin = request.headers.get('Origin')
  const referer = request.headers.get('Referer')
  return ALLOWED_ORIGINS.some((allowed) =>
    (origin && origin.startsWith(allowed)) ||
    (referer && referer.startsWith(allowed))
  )
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  if (!isAllowed(request)) {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  }

  const kv = env.VISIT_COUNTER
  const url = new URL(request.url)
  const readonly = url.searchParams.get('count') === 'false'

  const totalRaw = await kv.get('total')
  let total = parseInt(totalRaw || '0', 10)

  const dateKey = todayKey()
  const todayRaw = await kv.get(dateKey)
  let today = parseInt(todayRaw || '0', 10)

  if (!readonly) {
    total += 1
    today += 1
    context.waitUntil(Promise.all([
      kv.put('total', String(total)),
      kv.put(dateKey, String(today)),
    ]))
  }

  return new Response(JSON.stringify({ total, today }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
