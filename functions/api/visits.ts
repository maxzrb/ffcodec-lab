// ============================================================
// GET /api/visits — 今日访问量 + 历史总访问量
// GET /api/visits?count=false — 只读查询，不递增
// 使用 Cloudflare Pages Functions + KV 存储
// ============================================================

interface Env {
  VISIT_COUNTER: KVNamespace
}

function todayKey(): string {
  // UTC+8 北京时间
  const now = new Date()
  const offset = 8 * 60
  const local = new Date(now.getTime() + (now.getTimezoneOffset() + offset) * 60000)
  return local.toISOString().slice(0, 10) // YYYY-MM-DD
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const kv = context.env.VISIT_COUNTER
  const url = new URL(context.request.url)
  const readonly = url.searchParams.get('count') === 'false'

  // 历史总访问量
  const totalRaw = await kv.get('total')
  let total = parseInt(totalRaw || '0', 10)

  // 今日访问量
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
