const fs = require('fs')
const crypto = require('crypto')
const a = JSON.parse(
  fs.readFileSync(
    'e:/proyecto-titulo-inducta/Desarrollo_Proyecto/inducta-chile/supabase/functions/provisionar-cuenta-temporal/.mcp-args.json',
    'utf8',
  ),
)
const logoFile = fs.readFileSync(
  'e:/proyecto-titulo-inducta/Desarrollo_Proyecto/inducta-chile/supabase/functions/provisionar-cuenta-temporal/logoBase64.ts',
  'utf8',
)
const h = crypto.createHash('sha256').update(logoFile).digest('hex')
const logo = a.files[1].content
console.log(
  JSON.stringify({
    ready: true,
    project_id: a.project_id,
    name: a.name,
    verify_jwt: a.verify_jwt,
    index_len: a.files[0].content.length,
    logo_len: logo.length,
    sha256: h,
    export_ok: logo.startsWith('export const LOGO_AZUL_OSCURO_PNG_BASE64'),
    png_ok: logo.includes('iVBORw0KGgo'),
    end_ok: logo.endsWith('ASUVORK5CYII="\n'),
    match_disk: logo === logoFile,
  }),
)
