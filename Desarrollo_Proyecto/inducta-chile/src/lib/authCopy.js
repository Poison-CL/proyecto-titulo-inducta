export const AUTH_COPY = {
  loading: {
    sesion: 'Validando su sesión…',
    acceso: 'Preparando su acceso…',
    organizacion: 'Cargando su empresa…',
  },
  errores: {
    sinEmpresa: {
      title: 'Su cuenta no tiene una empresa asociada',
      body:
        'Las cuentas de empresa las crea el equipo de Inducta Chile según el plan contratado. Si su organización todavía no está dada de alta, contrate un plan o agende una demo.',
      ctaPrimario: 'Ver planes',
      ctaSecundario: 'Agendar demo',
      ctaSalir: 'Cerrar sesión',
    },
    sinMembresia: {
      title: 'No pertenece a ninguna empresa',
      body:
        'Su usuario inició sesión, pero todavía no está vinculado a ninguna empresa. Los accesos de los colaboradores los administra cada empresa: pida a su administrador que lo agregue.',
      ctaPrimario: 'Volver al inicio',
      ctaSalir: 'Cerrar sesión',
    },
    registroBloqueado: {
      title: 'No hay registro público',
      body:
        'No puede crear una cuenta desde la web. Las empresas las registra Inducta. Los empleados los agrega cada empresa.',
      ctaPrimario: 'Ver planes',
      ctaSecundario: 'Agendar demo',
      ctaVolver: 'Volver al ingreso',
    },
  },
}

export const RUTAS_AUTH = {
  entrar: '/entrar',
  entrarEmpresa: '/entrar/empresa',
  entrarEmpleado: '/entrar/empleado',
  postLogin: '/post-login',
  dashboard: '/dashboard',
  sinEmpresa: '/acceso/sin-empresa',
  sinMembresia: '/acceso/sin-membresia',
  registroBloqueado: '/acceso/registro',
  inicio: '/',
  precios: '/precios',
  contacto: '/contacto',
}
