// ponytail: artículos en código. Para publicar sin deploy, mover a una tabla `articulos` en Supabase con las mismas columnas.
// Bloques del cuerpo: string = párrafo, { h } = subtítulo, { lista } = viñetas.

export const TIPOS = {
  guias: { titulo: 'Guías de inducción', bajada: 'Paso a paso para preparar y acompañar el ingreso de cada colaborador.' },
  documentacion: { titulo: 'Documentación', bajada: 'Cómo funciona Inducta Chile, sección por sección.' },
}

/** Páginas estáticas del hub (antes rutas sueltas). Buscables junto a los artículos. */
export const PAGINAS = {
  capacitaciones: {
    titulo: 'Capacitaciones',
    bajada:
      'Su empresa crea sus propias capacitaciones y pruebas. Inducta Chile le da la plataforma para armarlas, asignarlas y medirlas.',
    secciones: [
      {
        titulo: 'Cómo se arma una capacitación',
        numerada: true,
        items: [
          { t: 'Cree el contenido', d: 'Escriba las etapas con el material que su equipo necesita aprender.' },
          { t: 'Agregue una prueba', d: 'Arme las preguntas con las que comprobará lo aprendido.' },
          { t: 'Asígnela por cargo o área', d: 'Cada colaborador ve solo las capacitaciones que le corresponden.' },
          { t: 'Revise los resultados', d: 'Vea quién la completó, cómo le fue en la prueba y en qué fecha.' },
        ],
      },
      {
        titulo: 'Lo que decide su empresa',
        items: [
          { t: 'El contenido', d: 'Qué se enseña y en qué orden. El material es suyo; nosotros no lo creamos ni lo modificamos.' },
          { t: 'Las preguntas', d: 'Qué se evalúa en cada prueba.' },
          { t: 'A quién se asigna', d: 'Por cargo, por área o a personas específicas.' },
        ],
      },
    ],
  },
  cumplimiento: {
    titulo: 'Cumplimiento',
    bajada:
      'Cada inducción y capacitación deja registro. Cuando le pidan evidencia en una auditoría o fiscalización, ya la tiene.',
    secciones: [
      {
        titulo: 'Qué queda registrado',
        items: [
          { t: 'Quién', d: 'El colaborador, su cargo y su área.' },
          { t: 'Qué', d: 'El programa asignado y sus contenidos.' },
          { t: 'Cuándo', d: 'La fecha en que completó cada etapa.' },
          { t: 'Resultado', d: 'Si terminó el programa y cómo le fue en las pruebas.' },
        ],
      },
      {
        titulo: 'Dónde suele pedirse esta evidencia',
        items: [
          {
            t: 'Ley 16.744 y DS 44',
            d: 'Informar a cada trabajador los riesgos de su puesto y las medidas preventivas al ingresar.',
          },
          {
            t: 'Ley 21.643 (Ley Karin)',
            d: 'Difundir el protocolo de prevención del acoso laboral, sexual y la violencia en el trabajo.',
          },
          {
            t: 'Reglamento interno',
            d: 'Dar a conocer el reglamento interno de orden, higiene y seguridad a cada colaborador.',
          },
        ],
      },
    ],
    nota: 'Esta información es referencial. Valide los requisitos de su empresa con su asesor legal o de prevención de riesgos.',
  },
}

export const ARTICULOS = [
  {
    slug: 'primer-dia-checklist',
    tipo: 'guias',
    categoria: 'Antes del ingreso',
    titulo: 'Checklist para el primer día de un colaborador',
    resumen: 'Lo que conviene tener listo antes de que la persona llegue: accesos, programa asignado y responsable.',
    fecha: '2026-10-01',
    minutos: 4,
    cuerpo: [
      'El primer día define cómo la persona percibe a la empresa. Una inducción ordenada empieza antes de que llegue.',
      { h: 'Una semana antes' },
      {
        lista: [
          'Cree su acceso en el panel con el correo que usará.',
          'Asigne el programa de inducción que corresponde a su cargo.',
          'Defina quién lo acompañará durante la primera semana.',
        ],
      },
      { h: 'El mismo día' },
      {
        lista: [
          'Confirme que puede entrar a la plataforma desde su correo.',
          'Revise con la persona el programa asignado y los plazos.',
          'Deje claro a quién preguntar si algo no queda claro.',
        ],
      },
      'Con esto el avance queda registrado desde el primer minuto y no hay que reconstruir nada después.',
    ],
  },
  {
    slug: 'programa-por-cargo',
    tipo: 'guias',
    categoria: 'Diseño del programa',
    titulo: 'Cómo armar un programa de inducción por cargo',
    resumen: 'Separar lo general de lo específico para que cada persona vea solo lo que necesita.',
    fecha: '2026-09-24',
    minutos: 6,
    cuerpo: [
      'Un buen programa no intenta enseñar todo. Separa lo que toda la empresa debe saber de lo que cada cargo necesita para trabajar.',
      { h: 'Parte general' },
      'Misión, normas internas, beneficios y seguridad básica. Se asigna a todos y se revisa una vez al año.',
      { h: 'Parte del cargo' },
      'Procesos, herramientas y responsabilidades propias del puesto. Conviene que la escriba el jefe directo, no recursos humanos.',
      { h: 'Etapas cortas' },
      'Divida el programa en etapas que se puedan completar en una sesión. Así el avance se ve día a día y es más fácil detectar quién se atrasó.',
    ],
  },
  {
    slug: 'seguimiento-primer-mes',
    tipo: 'guias',
    categoria: 'Durante el ingreso',
    titulo: 'Seguimiento del primer mes: qué mirar y cuándo',
    resumen: 'Tres momentos para revisar el avance sin perseguir a nadie.',
    fecha: '2026-09-15',
    minutos: 3,
    cuerpo: [
      'El panel muestra el avance de cada colaborador. La clave es mirarlo en los momentos correctos.',
      {
        lista: [
          'Día 3: ¿empezó el programa? Si no, suele ser un problema de acceso.',
          'Día 10: ¿completó la parte general? Es el mejor momento para una conversación corta.',
          'Día 30: ¿terminó la parte del cargo? La evidencia queda lista para auditoría.',
        ],
      },
    ],
  },
  {
    slug: 'induccion-seguridad',
    tipo: 'guias',
    categoria: 'Normativa',
    titulo: 'Inducción de seguridad: qué debe quedar registrado',
    resumen: 'Qué guardar para demostrar que la persona recibió la inducción de seguridad.',
    fecha: '2026-09-02',
    minutos: 5,
    cuerpo: [
      'En una fiscalización no basta con decir que la inducción se hizo. Hay que poder mostrarlo.',
      { h: 'Lo mínimo' },
      {
        lista: [
          'Quién recibió la inducción y en qué fecha.',
          'Qué contenidos incluía.',
          'Que la persona completó cada etapa.',
        ],
      },
      'Inducta Chile guarda ese registro por cada colaborador y programa, sin planillas aparte.',
    ],
  },
  {
    slug: 'crear-accesos',
    tipo: 'documentacion',
    categoria: 'Panel de empresa',
    titulo: 'Crear accesos para colaboradores',
    resumen: 'Cómo dar de alta a una persona para que entre con su correo.',
    fecha: '2026-10-08',
    minutos: 2,
    cuerpo: [
      'Los accesos se crean desde el panel de su empresa. Cada colaborador entra con su correo y ve solo los programas asignados a su cargo.',
      { h: 'Pasos' },
      {
        lista: [
          'Entre al panel con su cuenta de empresa.',
          'Agregue el correo del colaborador.',
          'Asigne el programa que le corresponde.',
        ],
      },
      'La persona entra desde Ingresar, eligiendo Empleado, y verifica su correo con un código o contraseña.',
    ],
  },
  {
    slug: 'ingresar-empresa-empleado',
    tipo: 'documentacion',
    categoria: 'Acceso',
    titulo: 'Ingresar como empresa o como empleado',
    resumen: 'La diferencia entre ambos accesos y cuál usar.',
    fecha: '2026-10-05',
    minutos: 2,
    cuerpo: [
      'En la pantalla de ingreso hay dos opciones.',
      {
        lista: [
          'Empresa: para quien administra programas, accesos y avance.',
          'Empleado: para quien realiza la inducción o capacitación.',
        ],
      },
      'En ambos casos se ingresa el correo y luego se verifica con un código o con contraseña.',
    ],
  },
  {
    slug: 'codigo-verificacion',
    tipo: 'documentacion',
    categoria: 'Acceso',
    titulo: 'No me llega el código de verificación',
    resumen: 'Qué revisar si el código para ingresar no aparece en su correo.',
    fecha: '2026-10-03',
    minutos: 2,
    cuerpo: [
      'Al ingresar con su correo, Inducta Chile le envía un código para verificar que es usted.',
      {
        lista: [
          'Revise las carpetas de spam y promociones.',
          'Confirme que escribió bien el correo en la pantalla de ingreso.',
          'Espere a que termine la cuenta regresiva y presione Reenviar código.',
          'Si su cuenta tiene contraseña, también puede ingresar con ella.',
        ],
      },
      'Si después de esto el código sigue sin llegar, escríbanos desde Contacto.',
    ],
  },
  {
    slug: 'leer-el-avance',
    tipo: 'documentacion',
    categoria: 'Panel de empresa',
    titulo: 'Cómo leer el avance del equipo',
    resumen: 'Qué significa cada porcentaje del panel y cómo se calcula.',
    fecha: '2026-09-28',
    minutos: 3,
    cuerpo: [
      'El panel muestra, por programa, cuántos colaboradores lo completaron sobre el total asignado.',
      'El porcentaje de cumplimiento resume todos los programas: indica qué parte del equipo está al día con lo que tiene asignado.',
      'Si un número no calza, revise primero que cada persona tenga el programa correcto asignado.',
    ],
  },
  {
    slug: 'planes-y-pago',
    tipo: 'documentacion',
    categoria: 'Planes y pago',
    titulo: 'Planes, facturación y pago con Webpay',
    resumen: 'Cómo se contrata un plan y qué pasa si el pago no se completa.',
    fecha: '2026-09-20',
    minutos: 3,
    cuerpo: [
      'Los planes se pagan mensual o anualmente desde la página de Precios. El valor se expresa en UF.',
      'Al contratar se piden los datos de facturación y el pago se hace en Webpay.',
      {
        lista: [
          'Pago exitoso: recibe la confirmación por correo y puede ingresar a la plataforma.',
          'Pago rechazado o anulado: no se realiza ningún cargo y puede intentarlo de nuevo.',
        ],
      },
    ],
  },
]

const normaliza = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const textoDe = (a) =>
  normaliza(
    [a.titulo, a.resumen, a.categoria, ...a.cuerpo.flatMap((b) => (typeof b === 'string' ? b : b.h ?? b.lista))].join(' '),
  )

export function buscar(tipo, consulta) {
  const palabras = normaliza(consulta).split(/\s+/).filter(Boolean)
  const enTitulo = (a) => palabras.every((p) => normaliza(a.titulo).includes(p))
  return ARTICULOS.filter((a) => a.tipo === tipo)
    .filter((a) => {
      const texto = textoDe(a)
      return palabras.every((p) => texto.includes(p))
    })
    .sort((a, b) => enTitulo(b) - enTitulo(a))
}

const textoPagina = (key, p) =>
  normaliza(
    [
      p.titulo,
      p.bajada,
      p.nota,
      ...(p.secciones ?? []).flatMap((s) => [s.titulo, ...s.items.flatMap((i) => [i.t, i.d])]),
    ]
      .filter(Boolean)
      .join(' '),
  )

/** Búsqueda en artículos + páginas del hub. */
export function buscarTodo(consulta) {
  const palabras = normaliza(consulta).split(/\s+/).filter(Boolean)
  if (!palabras.length) return []

  const articulos = ARTICULOS.filter((a) => palabras.every((p) => textoDe(a).includes(p))).map((a) => ({
    kind: 'articulo',
    slug: a.slug,
    to: `/recursos/${a.slug}`,
    titulo: a.titulo,
    resumen: a.resumen,
    etiqueta: TIPOS[a.tipo]?.titulo ?? a.tipo,
  }))

  const paginas = Object.entries(PAGINAS)
    .filter(([key, p]) => palabras.every((w) => textoPagina(key, p).includes(w)))
    .map(([key, p]) => ({
      kind: 'pagina',
      slug: key,
      to: `/recursos/${key}`,
      titulo: p.titulo,
      resumen: p.bajada,
      etiqueta: 'Sección',
    }))

  const textoSoporte = normaliza('soporte ayuda contacto preguntas frecuentes escribir equipo')
  const soporte = palabras.every((p) => textoSoporte.includes(p))
    ? [
        {
          kind: 'pagina',
          slug: 'soporte',
          to: '/recursos/soporte',
          titulo: 'Soporte',
          resumen: 'Preguntas frecuentes y contacto con el equipo.',
          etiqueta: 'Sección',
        },
      ]
    : []

  const enTitulo = (r) => palabras.every((p) => normaliza(r.titulo).includes(p))
  return [...articulos, ...paginas, ...soporte].sort((a, b) => enTitulo(b) - enTitulo(a))
}

export const getArticulo = (slug) => ARTICULOS.find((a) => a.slug === slug)

export const fechaCorta = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })

export const fechaLarga = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })

if (import.meta.env.DEV) {
  if (buscar('documentacion', 'WEBPAY').length !== 1) throw new Error('recursos: búsqueda sin mayúsculas')
  if (buscar('guias', 'FISCALIZACION')[0]?.slug !== 'induccion-seguridad') throw new Error('recursos: tildes')
  if (buscar('guias', 'webpay').length !== 0) throw new Error('recursos: filtra por tipo')
  if (buscar('guias', '').length !== 4) throw new Error('recursos: consulta vacía')
  if (buscar('documentacion', 'codigo')[0]?.slug !== 'codigo-verificacion') throw new Error('recursos: título primero')
  if (buscarTodo('webpay').length < 1) throw new Error('recursos: buscarTodo webpay')
  if (buscarTodo('capacitacion').some((r) => r.slug === 'capacitaciones') === false)
    throw new Error('recursos: buscarTodo páginas')
}
