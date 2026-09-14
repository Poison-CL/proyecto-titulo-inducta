// Todos los textos de las pantallas de acceso juntos, para no repetirlos por ahi
export const AUTH_COPY = {
  loading: {
    sesion: 'Validando tu sesión…',
    acceso: 'Preparando tu acceso…',
    organizacion: 'Cargando tu empresa…',
  },
  errores: {
    sinEmpresa: {
      title: 'Tu cuenta no tiene una empresa asociada',
      body:
        'Las cuentas de empresa las crea el equipo de Inducta Chile según el plan contratado. Si tu organización todavía no está dada de alta, contrata un plan o agenda una demo.',
      ctaPrimario: 'Ver planes',
      ctaSecundario: 'Agendar demo',
      ctaSalir: 'Cerrar sesión',
    },
    sinMembresia: {
      title: 'No perteneces a ninguna empresa',
      body:
        'Tu usuario inició sesión, pero todavía no está vinculado a ninguna empresa. Los accesos de los colaboradores los administra cada empresa: pide a tu administrador que te agregue.',
      ctaPrimario: 'Volver al inicio',
      ctaSalir: 'Cerrar sesión',
    },
    registroBloqueado: {
      title: 'No hay registro público',
      body:
        'No puedes crear una cuenta desde la web. Las empresas las registra Inducta. Los empleados los agrega cada empresa.',
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
