import { useOrganization, useUser } from '@clerk/clerk-react'
import { useSupabase } from '../hooks/useSupabase'
import { useState, useEffect } from 'react'

export default function AdminLayout({ children }) {
  const { organization } = useOrganization()
  const { user } = useUser()
  const supabase = useSupabase()
  
  const [empresaGuardada, setEmpresaGuardada] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function verificarEmpresa() {
      if (!organization) return
      
      // Intenta leer la empresa actual en Supabase usando el aislamiento RLS
      const { data, error } = await supabase
        .from('empresa')
        .select('*')
        .eq('id_empresa', organization.id)
        .single()

      if (data) {
        setEmpresaGuardada(true)
      }
    }

    verificarEmpresa()
  }, [organization, supabase])

  const registrarEmpresa = async () => {
    if (!organization) return
    setLoading(true)

    const { error } = await supabase.from('empresa').insert([
      {
        id_empresa: organization.id,
        nombre_comercial: organization.name,
      }
    ])

    if (!error) {
      setEmpresaGuardada(true)
    } else {
      console.error("Error al registrar:", error.message)
    }
    setLoading(false)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar provisional */}
      <aside className="w-64 bg-white border-r p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold text-blue-600 mb-6">Inducta CHILE</h2>
          <nav className="space-y-3">
            <a href="#" className="block p-2 rounded hover:bg-gray-50 font-medium">Inicio</a>
            <a href="#" className="block p-2 rounded hover:bg-gray-50 font-medium">Empresa</a>
            <a href="#" className="block p-2 rounded hover:bg-gray-50 font-medium">Evaluaciones</a>
          </nav>
        </div>
        <div className="text-sm text-gray-500">
          <p className="font-semibold text-gray-700">{user?.fullName}</p>
          <p className="truncate">Org: {organization?.name}</p>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm border">
          <h1 className="text-2xl font-bold mb-4">Panel de Control Corporativo</h1>
          
          {!empresaGuardada ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 mb-3">La organización actual aún no está sincronizada con Supabase.</p>
              <button 
                onClick={registrarEmpresa}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Sincronizando..." : "Sincronizar Empresa con Base de Datos"}
              </button>
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">✓ Organización sincronizada correctamente con Supabase bajo RLS.</p>
            </div>
          )}

          <div className="mt-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}