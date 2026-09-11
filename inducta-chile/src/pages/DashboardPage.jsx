import { useEmpresaSync } from '../features/empresa/useEmpresaSync'

export default function DashboardPage() {
  const { synced, loading, error, sync } = useEmpresaSync()

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-sm border">
      <h1 className="text-2xl font-bold mb-4">Panel de Control Corporativo</h1>

      {!synced ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 mb-3">
            La organización actual aún no está sincronizada con Supabase.
          </p>
          {error ? <p className="text-red-600 text-sm mb-3">{error}</p> : null}
          <button
            type="button"
            onClick={sync}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sincronizando...' : 'Sincronizar Empresa con Base de Datos'}
          </button>
        </div>
      ) : (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            Organización sincronizada correctamente con Supabase bajo RLS.
          </p>
        </div>
      )}
    </div>
  )
}
