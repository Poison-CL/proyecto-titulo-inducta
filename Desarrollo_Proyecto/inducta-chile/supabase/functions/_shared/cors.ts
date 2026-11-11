/** CORS restringido a FRONTEND_URL (coma-separado si hay varios). */
export function corsHeaders(req?: Request): Record<string, string> {
  const allowed = String(Deno.env.get('FRONTEND_URL') || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const origin = req?.headers.get('Origin') || ''
  const allow = allowed.includes(origin) ? origin : allowed[0] || '*'
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, x-inducta-secret',
    'Vary': 'Origin',
  }
}

export function jsonResponse(body: unknown, status = 200, req?: Request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
  })
}

export function optionsResponse(req: Request) {
  return new Response('ok', { headers: corsHeaders(req) })
}
