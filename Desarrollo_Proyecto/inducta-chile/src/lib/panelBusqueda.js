/** Búsqueda del panel: primero secciones, luego datos (Supabase / miembros). */

export const RUTAS_BUSQUEDA_ADMIN = [
  { to: '/admin/tickets', keys: ['ticket', 'tickets', 'contacto', 'contactos'] },
  { to: '/admin/pagos', keys: ['pago', 'pagos', 'webpay', 'cobro', 'cobros', 'billing'] },
  { to: '/admin/usuarios', keys: ['usuario', 'usuarios', 'acceso', 'accesos', 'team'] },
  { to: '/admin/soporte', keys: ['soporte', 'ayuda', 'support'] },
  { to: '/admin/empresas', keys: ['empresa', 'empresas', 'cuenta', 'cuentas', 'plan', 'planes'] },
  { to: '/admin', keys: ['resumen', 'inicio', 'home', 'workspace'] },
]

export const RUTAS_BUSQUEDA_EMPRESA = [
  { to: '/dashboard', keys: ['inicio', 'home', 'resumen', 'panel', 'workspace'] },
  { to: '/dashboard/equipo', keys: ['equipo', 'colaborador', 'colaboradores', 'invitar', 'miembro', 'miembros', 'team'] },
  { to: '/dashboard/configuracion', keys: ['configuracion', 'config', 'cuenta', 'plan', 'planes', 'datos', 'contacto', 'billing', 'settings'] },
]

export function matchSeccion(consulta, routes) {
  const v = consulta.trim().toLowerCase()
  if (!v) return null
  for (const r of routes) {
    if (r.keys.some((k) => v === k || v.startsWith(`${k} `))) return r.to
  }
  return null
}

export function rutaConQ(path, q) {
  return `${path}?q=${encodeURIComponent(q.trim())}`
}

export function textoCoincide(haystack, consulta) {
  const v = String(consulta || '')
    .trim()
    .toLowerCase()
  if (!v) return true
  return String(haystack ?? '')
    .toLowerCase()
    .includes(v)
}

export function filtraPorCampos(rows, consulta, campos) {
  const v = String(consulta || '').trim()
  if (!v) return rows
  return rows.filter((r) => campos.some((c) => textoCoincide(r[c], v)))
}

function patronIlike(q) {
  return `%${String(q).replace(/[%_",]/g, '').trim()}%`
}

function orIlike(cols, q) {
  const pat = patronIlike(q)
  return cols.map((c) => `${c}.ilike."${pat}"`).join(',')
}

/**
 * @returns {Promise<{ to: string|null, msg?: string }>}
 */
export async function resolverBusquedaAdmin(supabase, consulta) {
  const q = consulta.trim()
  if (!q) return { to: null, msg: 'Escriba algo para buscar.' }

  const seccion = matchSeccion(q, RUTAS_BUSQUEDA_ADMIN)
  if (seccion) return { to: seccion }

  if (q.length < 2) return { to: null, msg: 'Escriba al menos 2 caracteres.' }

  const [usuarios, empresas, tickets, pagos] = await Promise.all([
    supabase
      .from('usuario')
      .select('id_usuario')
      .or(orIlike(['nombre_completo', 'rut', 'id_usuario'], q))
      .limit(1),
    supabase
      .from('empresa')
      .select('id_empresa')
      .or(orIlike(['nombre_comercial', 'email_contacto', 'email_temporal'], q))
      .limit(1),
    supabase
      .from('contactos')
      .select('id')
      .or(orIlike(['nombre', 'email', 'empresa', 'mensaje', 'motivo'], q))
      .limit(1),
    supabase
      .from('pagos_transbank')
      .select('id_pago')
      .or(orIlike(['nombre_comercial', 'email_contacto', 'orden_compra'], q))
      .limit(1),
  ])

  if (usuarios.data?.length) return { to: rutaConQ('/admin/usuarios', q) }
  if (empresas.data?.length) return { to: rutaConQ('/admin/empresas', q) }
  if (tickets.data?.length) return { to: rutaConQ('/admin/tickets', q) }
  if (pagos.data?.length) return { to: rutaConQ('/admin/pagos', q) }

  return { to: null, msg: `No encontramos «${q}» en el panel.` }
}

/**
 * @param {{ admin: boolean, miembros?: array, invitaciones?: array }} opts
 */
export async function resolverBusquedaEmpresa(supabase, orgId, consulta, opts = {}) {
  const { admin = false, miembros = [], invitaciones = [] } = opts
  const q = consulta.trim()
  if (!q) return { to: null, msg: 'Escriba algo para buscar.' }

  const routes = admin
    ? RUTAS_BUSQUEDA_EMPRESA
    : RUTAS_BUSQUEDA_EMPRESA.filter((r) => r.to !== '/dashboard/equipo')
  const seccion = matchSeccion(q, routes)
  if (seccion) return { to: seccion }

  if (q.length < 2) return { to: null, msg: 'Escriba al menos 2 caracteres.' }

  if (admin) {
    const enEquipo = miembros.some((m) => {
      const u = m.publicUserData
      const nombre = [u?.firstName, u?.lastName].filter(Boolean).join(' ')
      return (
        textoCoincide(nombre, q) ||
        textoCoincide(u?.identifier, q) ||
        textoCoincide(u?.userId, q)
      )
    })
    const enInvites = invitaciones.some((i) => textoCoincide(i.emailAddress, q))
    if (enEquipo || enInvites) return { to: rutaConQ('/dashboard/equipo', q) }

    if (orgId) {
      const { data } = await supabase
        .from('usuario')
        .select('id_usuario')
        .eq('id_empresa', orgId)
        .or(orIlike(['nombre_completo', 'rut', 'id_usuario'], q))
        .limit(1)
      if (data?.length) return { to: rutaConQ('/dashboard/equipo', q) }
    }
  }

  if (orgId) {
    const { data: emp } = await supabase
      .from('empresa')
      .select('id_empresa')
      .eq('id_empresa', orgId)
      .or(orIlike(['nombre_comercial', 'email_contacto', 'email_temporal'], q))
      .limit(1)
    if (emp?.length) return { to: rutaConQ('/dashboard/configuracion', q) }
  }

  return { to: null, msg: `No encontramos «${q}» en el panel.` }
}

if (import.meta.env.DEV) {
  if (matchSeccion('usuarios', RUTAS_BUSQUEDA_ADMIN) !== '/admin/usuarios') {
    throw new Error('panelBusqueda: seccion usuarios')
  }
  if (rutaConQ('/admin/usuarios', 'Hans Elfert') !== '/admin/usuarios?q=Hans%20Elfert') {
    throw new Error('panelBusqueda: rutaConQ')
  }
  if (!textoCoincide('Hans Elfert', 'hans')) throw new Error('panelBusqueda: textoCoincide')
  if (filtraPorCampos([{ n: 'Hans' }, { n: 'Ana' }], 'han', ['n']).length !== 1) {
    throw new Error('panelBusqueda: filtraPorCampos')
  }
}
