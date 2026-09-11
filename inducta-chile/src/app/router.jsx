import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from '../components/auth/RequireAuth'
import RequireOrg from '../components/auth/RequireOrg'
import AdminLayout from '../layouts/AdminLayout'
import SiteLayout from '../layouts/SiteLayout'
import {
  AccesoRegistroPage,
  AccesoSinEmpresaPage,
  AccesoSinMembresiaPage,
} from '../pages/AccesoPages'
import ContactoPage from '../pages/ContactoPage'
import DashboardPage from '../pages/DashboardPage'
import EntrarPage from '../pages/EntrarPage'
import HomePage from '../pages/HomePage'
import NoEncontradaPage from '../pages/NoEncontradaPage'
import PostLoginPage from '../pages/PostLoginPage'
import PreciosPage from '../pages/PreciosPage'
import RecursosPage from '../pages/RecursosPage'
import { RUTAS_AUTH } from '../lib/authCopy'

function ProtectedApp() {
  return (
    <RequireAuth>
      <RequireOrg>
        <AdminLayout />
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
          <Route path="/recursos" element={<RecursosPage />} />
          <Route path="/contacto" element={<ContactoPage />} />
          <Route path="*" element={<NoEncontradaPage />} />
        </Route>

        {/* Flujo de autenticacion */}
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

        {/* Pantallas para cuando el usuario entro pero no puede pasar al panel */}
        <Route path={RUTAS_AUTH.sinEmpresa} element={<AccesoSinEmpresaPage />} />
        <Route path={RUTAS_AUTH.sinMembresia} element={<AccesoSinMembresiaPage />} />
        <Route path={RUTAS_AUTH.registroBloqueado} element={<AccesoRegistroPage />} />

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

        <Route path="/dashboard" element={<ProtectedApp />}>
          <Route index element={<DashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
