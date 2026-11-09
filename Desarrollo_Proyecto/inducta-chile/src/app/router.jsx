import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from '../components/auth/RequireAuth'
import RequireAdminPlataforma from '../components/auth/RequireAdminPlataforma'
import RequireEmpleado from '../components/auth/RequireEmpleado'
import RequireOrg from '../components/auth/RequireOrg'
import AdminLayout from '../layouts/AdminLayout'
import EmpleadoLayout from '../layouts/EmpleadoLayout'
import SoporteAdminLayout from '../layouts/SoporteAdminLayout'
import RecursosLayout from '../layouts/RecursosLayout'
import SiteLayout from '../layouts/SiteLayout'
import AdminResumenPage from '../pages/admin/AdminResumenPage'
import AdminSoportePage from '../pages/admin/AdminSoportePage'
import AdminTicketsPage from '../pages/admin/AdminTicketsPage'
import AdminEmpresasPage from '../pages/admin/AdminEmpresasPage'
import AdminPagosPage from '../pages/admin/AdminPagosPage'
import AdminUsuariosPage from '../pages/admin/AdminUsuariosPage'
import {
  AccesoRegistroPage,
  AccesoSinEmpresaPage,
  AccesoSinMembresiaPage,
} from '../pages/auth/AccesoPages'
import ArticuloPage from '../pages/public/ArticuloPage'
import ContactoPage from '../pages/public/ContactoPage'
import ContratarPage from '../pages/public/ContratarPage'
import DashboardPage from '../pages/app/DashboardPage'
import ConfiguracionPage from '../pages/app/ConfiguracionPage'
import EquipoPage from '../pages/app/EquipoPage'
import EmpleadoDashboardPage from '../pages/empleado/EmpleadoDashboardPage'
import EmpleadoProgramasPage from '../pages/empleado/EmpleadoProgramasPage'
import EmpleadoProgresosPage from '../pages/empleado/EmpleadoProgresosPage'
import EmpleadoCertificadosPage from '../pages/empleado/EmpleadoCertificadosPage'
import EmpleadoPerfilPage from '../pages/empleado/EmpleadoPerfilPage'
import CuentaDeshabilitadaPage from '../pages/CuentaDeshabilitadaPage'
import EntrarPage from '../pages/auth/EntrarPage'
import HomePage from '../pages/public/HomePage'
import NoEncontradaPage from '../pages/public/NoEncontradaPage'
import PostLoginPage from '../pages/auth/PostLoginPage'
import PreciosPage from '../pages/public/PreciosPage'
import RecursoInfoPage from '../pages/public/RecursoInfoPage'
import RecursosPage from '../pages/public/RecursosPage'
import SoportePage from '../pages/public/SoportePage'
import { RUTAS_AUTH } from '../lib/authCopy'
import PagoResultadoPage from '../pages/public/PagoResultadoPage'


// Guard: Admin de empresa (/dashboard)
function ProtectedApp() {
  return (
    <RequireAuth>
      <RequireOrg>
        <AdminLayout />
      </RequireOrg>
    </RequireAuth>
  )
}

// Guard: Admin de plataforma Inducta (/admin)
function ProtectedAdminPlataforma() {
  return (
    <RequireAuth>
      <RequireOrg>
        <RequireAdminPlataforma>
          <SoporteAdminLayout />
        </RequireAdminPlataforma>
      </RequireOrg>
    </RequireAuth>
  )
}

// Guard: Empleado/miembro (/empleado)
function ProtectedEmpleado() {
  return (
    <RequireAuth>
      <RequireOrg>
        <RequireEmpleado>
          <EmpleadoLayout />
        </RequireEmpleado>
      </RequireOrg>
    </RequireAuth>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/precios" element={<PreciosPage />} />
          <Route path="/contratar" element={<ContratarPage />} />
          <Route path="/pago/exitoso" element={<PagoResultadoPage />} />
          <Route path="/pago/rechazado" element={<PagoResultadoPage />} />
          <Route path="/pago/anulado" element={<PagoResultadoPage />} />
          <Route path="/pago-exitoso" element={<Navigate to="/pago/exitoso" replace />} />
          {/* splat /*: RR7 rematch de hijos al navegar entre secciones del hub */}
          <Route path="/recursos/*" element={<RecursosLayout />}>
            <Route index element={<RecursosPage />} />
            <Route path="guias" element={<RecursosPage tipo="guias" />} />
            <Route path="documentacion" element={<RecursosPage tipo="documentacion" />} />
            <Route path="capacitaciones" element={<RecursoInfoPage pagina="capacitaciones" />} />
            <Route path="cumplimiento" element={<RecursoInfoPage pagina="cumplimiento" />} />
            <Route path="soporte" element={<SoportePage />} />
            <Route path=":slug" element={<ArticuloPage />} />
          </Route>
          <Route path="/contacto" element={<ContactoPage />} />
          <Route path="*" element={<NoEncontradaPage />} />
        </Route>

        <Route path={RUTAS_AUTH.entrar} element={<EntrarPage />} />
        <Route
          path={`${RUTAS_AUTH.entrarEmpresa}/*`}
          element={<Navigate to={`${RUTAS_AUTH.entrar}?rol=empresa`} replace />}
        />
        <Route
          path={`${RUTAS_AUTH.entrarEmpleado}/*`}
          element={<Navigate to={`${RUTAS_AUTH.entrar}?rol=empleado`} replace />}
        />
        <Route path={RUTAS_AUTH.postLogin} element={<PostLoginPage />} />

        {/* Pantallas para cuando el usuario entró pero no puede pasar al panel */}
        <Route path={RUTAS_AUTH.sinEmpresa} element={<AccesoSinEmpresaPage />} />
        <Route path={RUTAS_AUTH.sinMembresia} element={<AccesoSinMembresiaPage />} />
        <Route path={RUTAS_AUTH.registroBloqueado} element={<AccesoRegistroPage />} />
        <Route
          path="/cuenta-deshabilitada"
          element={
            <RequireAuth>
              <CuentaDeshabilitadaPage />
            </RequireAuth>
          }
        />

        {/* Rutas viejas que dejamos redirigiendo para no romper links guardados */}
        <Route path="/sign-in/*" element={<Navigate to={RUTAS_AUTH.entrar} replace />} />
        <Route
          path="/sign-up/*"
          element={<Navigate to={RUTAS_AUTH.registroBloqueado} replace />}
        />
        <Route
          path="/acceso-restringido"
          element={<Navigate to={RUTAS_AUTH.registroBloqueado} replace />}
        />

        {/* Dashboard: Admin de Empresa */}
        <Route path="/dashboard" element={<ProtectedApp />}>
          <Route index element={<DashboardPage />} />
          <Route path="equipo" element={<EquipoPage />} />
          <Route path="configuracion" element={<ConfiguracionPage />} />
        </Route>

        {/* Dashboard: Empleado/Colaborador */}
        <Route path="/empleado" element={<ProtectedEmpleado />}>
          <Route index element={<EmpleadoDashboardPage />} />
          <Route path="programas" element={<EmpleadoProgramasPage />} />
          <Route path="progreso" element={<EmpleadoProgresosPage />} />
          <Route path="certificados" element={<EmpleadoCertificadosPage />} />
          <Route path="perfil" element={<EmpleadoPerfilPage />} />
        </Route>

        {/* Dashboard: Admin de Plataforma Inducta */}
        <Route path="/admin" element={<ProtectedAdminPlataforma />}>
          <Route index element={<AdminResumenPage />} />
          <Route path="soporte" element={<AdminSoportePage />} />
          <Route path="tickets" element={<AdminTicketsPage />} />
          <Route path="empresas" element={<AdminEmpresasPage />} />
          <Route path="pagos" element={<AdminPagosPage />} />
          <Route path="usuarios" element={<AdminUsuariosPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
