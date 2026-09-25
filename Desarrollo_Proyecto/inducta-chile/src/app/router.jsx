import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from '../components/auth/RequireAuth'
import RequireOrg from '../components/auth/RequireOrg'
import AdminLayout from '../layouts/AdminLayout'
import SiteLayout from '../layouts/SiteLayout'
import {
  AccesoRegistroPage,
  AccesoSinEmpresaPage,
  AccesoSinMembresiaPage,
} from '../pages/auth/AccesoPages'
import ContactoPage from '../pages/public/ContactoPage'
import ContratarPage from '../pages/public/ContratarPage'
import DashboardPage from '../pages/app/DashboardPage'
import EntrarPage from '../pages/auth/EntrarPage'
import HomePage from '../pages/public/HomePage'
import NoEncontradaPage from '../pages/public/NoEncontradaPage'
import PostLoginPage from '../pages/auth/PostLoginPage'
import PreciosPage from '../pages/public/PreciosPage'
import RecursosPage from '../pages/public/RecursosPage'
import { RUTAS_AUTH } from '../lib/authCopy'
import PagoResultadoPage from '../pages/public/PagoResultadoPage'


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
          <Route path="/contratar" element={<ContratarPage />} />
          <Route path="/pago/exitoso" element={<PagoResultadoPage />} />
          <Route path="/pago/rechazado" element={<PagoResultadoPage />} />
          <Route path="/pago/anulado" element={<PagoResultadoPage />} />
          <Route path="/pago-exitoso" element={<Navigate to="/pago/exitoso" replace />} />
          <Route path="/recursos" element={<RecursosPage />} />
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
