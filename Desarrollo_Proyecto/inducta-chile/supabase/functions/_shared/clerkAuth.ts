/**
 * Verifica el JWT de sesión de Clerk (firma + exp).
 * No usar atob/JSON.parse del payload sin verificar.
 */
import { verifyToken } from 'npm:@clerk/backend@1.21.0'

export type ClerkAuth = {
  userId: string
  orgId: string | null
  orgRole: string | null
}

export class AuthError extends Error {
  status: number
  constructor(message: string, status = 401) {
    super(message)
    this.status = status
  }
}

function parties(): string[] {
  const raw = Deno.env.get('FRONTEND_URL') || ''
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export async function requireClerkAuth(req: Request, opts?: { requireOrg?: boolean }): Promise<ClerkAuth> {
  const header = req.headers.get('Authorization')
  if (!header?.startsWith('Bearer ')) {
    throw new AuthError('Sin sesión', 401)
  }
  const token = header.slice(7).trim()
  if (!token || token.split('.').length < 3) {
    throw new AuthError('Token inválido', 401)
  }

  const secretKey = Deno.env.get('CLERK_SECRET_KEY')
  if (!secretKey) {
    throw new AuthError('Falta CLERK_SECRET_KEY en el servidor', 500)
  }

  const authorizedParties = parties()
  if (!authorizedParties.length) {
    throw new AuthError('Falta FRONTEND_URL en el servidor', 500)
  }

  let payload: Record<string, unknown>
  try {
    payload = (await verifyToken(token, {
      secretKey,
      authorizedParties,
    })) as Record<string, unknown>
  } catch {
    throw new AuthError('Sesión inválida o expirada', 401)
  }

  const userId = typeof payload.sub === 'string' ? payload.sub : null
  if (!userId) throw new AuthError('Token sin usuario', 401)

  const o = payload.o as { id?: string; rol?: string; role?: string } | undefined
  const orgId =
    (typeof payload.org_id === 'string' && payload.org_id) ||
    (typeof o?.id === 'string' && o.id) ||
    (typeof payload.organization_id === 'string' && payload.organization_id) ||
    null
  const orgRole =
    (typeof payload.org_role === 'string' && payload.org_role) ||
    (typeof o?.rol === 'string' && o.rol) ||
    (typeof o?.role === 'string' && o.role) ||
    null

  if (opts?.requireOrg && !orgId) {
    throw new AuthError('Debe seleccionar una organización', 403)
  }

  return { userId, orgId, orgRole }
}
