import { useOrganization, useUser } from '@clerk/clerk-react'
import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
  const { user } = useUser()
  const { organization } = useOrganization()

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold text-blue-600 mb-6">Inducta CHILE</h2>
          <nav className="space-y-3">
            <a href="/dashboard" className="block p-2 rounded hover:bg-gray-50 font-medium">
              Inicio
            </a>
            <a href="#" className="block p-2 rounded hover:bg-gray-50 font-medium">
              Empresa
            </a>
            <a href="#" className="block p-2 rounded hover:bg-gray-50 font-medium">
              Evaluaciones
            </a>
          </nav>
        </div>
        <div className="text-sm text-gray-500">
          <p className="font-semibold text-gray-700">{user?.fullName}</p>
          <p className="truncate">Org: {organization?.name}</p>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
