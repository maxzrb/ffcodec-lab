// ============================================================
// GET /api/visits — 今日访问量 + 历史总访问量
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

  // 历史总访问量
  const totalRaw = await kv.get('total')
  const total = (parseInt(totalRaw || '0', 10)) + 1

  // 今日访问量
  const dateKey = todayKey()
  const todayRaw = await kv.get(dateKey)
  const today = (parseInt(todayRaw || '0', 10)) + 1

  // 异步写回 KV，不阻塞响应
  context.waitUntil(Promise.all([
    kv.put('total', String(total)),
    kv.put(dateKey, String(today)),
  ]))

  return new Response(JSON.stringify({ total, today }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
