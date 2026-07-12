// ============================================================
// GET /api/visits — 全局访问量计数器
// 使用 Cloudflare Pages Functions + KV 存储
// ============================================================

interface Env {
  VISIT_COUNTER: KVNamespace
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const current = await context.env.VISIT_COUNTER.get('total')
  const next = (parseInt(current || '0', 10)) + 1

  // 异步写回 KV，不阻塞响应
  context.waitUntil(context.env.VISIT_COUNTER.put('total', String(next)))

  return new Response(JSON.stringify({ visits: next }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
