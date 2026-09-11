// Todos los textos de las pantallas de acceso juntos, para no repetirlos por ahi
export const AUTH_COPY = {
  entrar: {
    title: 'Entrar al sistema',
    subtitle: 'Elige como quieres ingresar. Las cuentas las administra Inducta Chile.',
    empresa: {
      title: 'Soy empresa',
      desc: 'Acceso para administradores con cuenta creada por Inducta.',
    },
    empleado: {
      title: 'Soy empleado',
      desc: 'Acceso para colaboradores invitados por su empresa.',
    },
  },
  signIn: {
    empresa: {
      title: 'Ingreso empresa',
      subtitle:
        'Usa el correo que Inducta registro para tu organizacion. No hay alta automatica desde la web.',
      help: 'Si tu empresa aun no tiene acceso, contrata un plan o agenda una demo.',
    },
    empleado: {
      title: 'Ingreso empleado',
      subtitle:
        'Usa el correo con el que tu empresa te invito. Si no tienes cuenta, pide ayuda a tu administrador.',
      help: 'Inducta no crea cuentas de empleado desde este sitio.',
    },
  },
  loading: {
    sesion: 'Validando tu sesion…',
    acceso: 'Preparando tu acceso…',
    organizacion: 'Cargando tu empresa…',
  },
  errores: {
    sinEmpresa: {
      title: 'Tu cuenta no tiene una empresa asociada',
      body:
        'Las cuentas de empresa las crea el equipo de Inducta Chile segun el plan contratado. Si tu organizacion todavia no esta dada de alta, contrata un plan o agenda una demo.',
      ctaPrimario: 'Ver planes',
      ctaSecundario: 'Agendar demo',
      ctaSalir: 'Cerrar sesion',
    },
    sinMembresia: {
      title: 'No perteneces a ninguna empresa',
      body:
        'Tu usuario inicio sesion, pero no esta vinculado a una organizacion. Contacta al soporte interno de tu empresa para que te agreguen. Si necesitas ayuda de Inducta, escribe a contacto.',
      ctaPrimario: 'Contactar Inducta',
      ctaSecundario: 'Volver al inicio',
      ctaSalir: 'Cerrar sesion',
    },
    registroBloqueado: {
      title: 'No hay registro publico',
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
