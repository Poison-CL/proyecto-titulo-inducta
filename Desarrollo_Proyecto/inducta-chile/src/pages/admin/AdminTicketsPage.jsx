import { Navigate } from 'react-router-dom'

/** La bandeja viva vive en /admin/soporte (respuesta por correo incluida). */
export default function AdminTicketsPage() {
  return <Navigate to="/admin/soporte" replace />
}
