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
      'Su empresa crea niveles de estudio (texto y YouTube), cuestionarios y revisa avances. Inducta Chile da la plataforma; el contenido es suyo.',
    secciones: [
      {
        titulo: 'Cómo se arma una capacitación',
        numerada: true,
        items: [
          {
            t: 'Cree la evaluación',
            d: 'En Programas → Nueva evaluación: título, exigencia de aprobación y preguntas.',
          },
          {
            t: 'Agregue niveles de estudio',
            d: 'Estructura Nivel → Lección → contenido (texto o video de YouTube). Completar el estudio desbloquea el cuestionario.',
          },
          {
            t: 'Publique',
            d: 'Deje la evaluación en estado Publicada para que los colaboradores la vean en Mis programas.',
          },
          {
            t: 'Revise avances y constancias',
            d: 'En la pestaña Avances ve quién estudió, rindió y aprobó. Quienes aprueban pueden descargar su constancia.',
          },
        ],
      },
      {
        titulo: 'Lo que decide su empresa',
        items: [
          {
            t: 'El contenido',
            d: 'Qué se enseña, el orden de niveles y si usa textos o videos. Inducta no crea ni modifica su material.',
          },
          { t: 'Las preguntas', d: 'Qué se evalúa y el porcentaje mínimo para aprobar.' },
          {
            t: 'El tope del plan',
            d: 'Demo: 1 evaluación. Básico: hasta 5. Plus y Plus+: sin límite de evaluaciones.',
          },
        ],
      },
    ],
  },
  cumplimiento: {
    titulo: 'Cumplimiento',
    bajada:
      'Cada inducción deja registro de estudio, nota y constancia. Cuando le pidan evidencia en una auditoría, ya la tiene.',
    secciones: [
      {
        titulo: 'Qué queda registrado',
        items: [
          { t: 'Quién', d: 'El colaborador y su organización.' },
          { t: 'Qué', d: 'El programa, niveles completados y el cuestionario.' },
          { t: 'Cuándo', d: 'La fecha de evaluación y el progreso de estudio.' },
          {
            t: 'Resultado',
            d: 'Estado (pendiente, en curso, aprobada o reprobada), puntaje y constancia al aprobar.',
          },
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
    resumen: 'Lo que conviene tener listo antes de que la persona llegue: acceso, programa publicado y responsable.',
    fecha: '2026-11-11',
    minutos: 4,
    cuerpo: [
      'El primer día define cómo la persona percibe a la empresa. Una inducción ordenada empieza antes de que llegue.',
      { h: 'Una semana antes' },
      {
        lista: [
          'Invítelo desde Equipo con el correo que usará (respeete el cupo de su plan).',
          'Publique el programa de inducción con niveles de estudio y cuestionario.',
          'Defina quién lo acompañará durante la primera semana.',
        ],
      },
      { h: 'El mismo día' },
      {
        lista: [
          'Confirme que puede entrar desde Ingresar → Empleado.',
          'Revise con la persona Mis programas: estudio primero, luego la prueba.',
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
    resumen: 'Separe lo general de lo específico y organícelo en niveles cortos con texto o video.',
    fecha: '2026-11-11',
    minutos: 6,
    cuerpo: [
      'Un buen programa no intenta enseñar todo. Separa lo que toda la empresa debe saber de lo que cada cargo necesita.',
      { h: 'Parte general' },
      'Misión, normas internas, beneficios y seguridad básica. Un nivel con una o dos lecciones basta para empezar.',
      { h: 'Parte del cargo' },
      'Procesos, herramientas y riesgos del puesto. Conviene que el contenido lo escriba el jefe directo.',
      { h: 'Niveles y lecciones' },
      'Use Nivel → Lección → contenido (texto o YouTube). Etapas cortas se completan en una sesión y el colaborador ve su progreso en porcentaje.',
      { h: 'Cuestionario al final' },
      'El cuestionario se desbloquea solo cuando completa el estudio. Defina la exigencia (por ejemplo 75 %) al crear la evaluación.',
    ],
  },
  {
    slug: 'seguimiento-primer-mes',
    tipo: 'guias',
    categoria: 'Durante el ingreso',
    titulo: 'Seguimiento del primer mes: qué mirar y cuándo',
    resumen: 'Tres momentos para revisar Avances sin perseguir a nadie.',
    fecha: '2026-11-11',
    minutos: 3,
    cuerpo: [
      'En Programas → Avances ve el estado de cada colaborador por inducción (pendiente, en curso, aprobada o reprobada).',
      {
        lista: [
          'Día 3: ¿abrió el estudio? Si no, suele ser un problema de acceso o invitación.',
          'Día 10: ¿completó los niveles? Es el mejor momento para una conversación corta.',
          'Día 30: ¿aprobó el cuestionario? La constancia queda disponible para el colaborador.',
        ],
      },
    ],
  },
  {
    slug: 'induccion-seguridad',
    tipo: 'guias',
    categoria: 'Normativa',
    titulo: 'Inducción de seguridad: qué debe quedar registrado',
    resumen: 'Qué guardar para demostrar que la persona estudió y rindió la inducción de seguridad.',
    fecha: '2026-11-11',
    minutos: 5,
    cuerpo: [
      'En una fiscalización no basta con decir que la inducción se hizo. Hay que poder mostrarlo.',
      { h: 'Lo mínimo' },
      {
        lista: [
          'Quién recibió la inducción y en qué fecha rindió.',
          'Qué contenidos incluía (niveles, textos o videos).',
          'Que la persona completó el estudio y el resultado del cuestionario.',
        ],
      },
      'Inducta Chile guarda ese registro por colaborador y programa. Al aprobar, el colaborador puede abrir su constancia desde Mis certificados.',
    ],
  },
  {
    slug: 'crear-accesos',
    tipo: 'documentacion',
    categoria: 'Panel de empresa',
    titulo: 'Invitar colaboradores (Equipo)',
    resumen: 'Cómo dar de alta a una persona desde el panel para que entre con su correo.',
    fecha: '2026-11-11',
    minutos: 3,
    cuerpo: [
      'Los accesos se gestionan en Dashboard → Equipo. Cada colaborador entra con su correo y ve las inducciones publicadas de su empresa.',
      { h: 'Pasos' },
      {
        lista: [
          'Entre al panel con una cuenta administradora de la empresa.',
          'En Equipo, invite el correo del colaborador.',
          'Revise los cupos de su plan (Demo 5, Básico 50, Plus 250, Plus+ sin límite).',
        ],
      },
      'La persona entra desde Ingresar → Empleado y verifica con código o contraseña.',
    ],
  },
  {
    slug: 'niveles-de-estudio',
    tipo: 'documentacion',
    categoria: 'Programas',
    titulo: 'Niveles de estudio: texto y YouTube',
    resumen: 'Cómo armar Nivel → Lección → contenido y exigir estudio antes del cuestionario.',
    fecha: '2026-11-11',
    minutos: 4,
    cuerpo: [
      'Cada evaluación puede incluir niveles de estudio opcionales. Si agrega contenidos, el colaborador debe completarlos antes de rendir.',
      { h: 'Estructura' },
      {
        lista: [
          'Nivel: bloque temático (por ejemplo Introducción o EPP).',
          'Lección: subsección dentro del nivel.',
          'Contenido: texto o enlace de YouTube (watch, youtu.be o embed).',
        ],
      },
      { h: 'Dónde se edita' },
      'Al crear una evaluación (paso Niveles) o después con Agregar niveles / Editar niveles en la lista de Programas.',
      { h: 'Sin niveles' },
      'Si no agrega niveles, el cuestionario queda disponible de inmediato.',
    ],
  },
  {
    slug: 'rendir-como-empleado',
    tipo: 'documentacion',
    categoria: 'Panel del empleado',
    titulo: 'Estudiar y rendir como colaborador',
    resumen: 'Flujo en Mis programas: estudio, desbloqueo del cuestionario y constancia.',
    fecha: '2026-11-11',
    minutos: 3,
    cuerpo: [
      'En el panel del empleado, Mis programas lista las inducciones publicadas.',
      {
        lista: [
          'Si hay niveles pendientes: aparece Estudiar. Complete cada contenido (Completar y seguir).',
          'Cuando el estudio llega a 100 %: puede Rendir la evaluación.',
          'Si aprueba: Constancia y Mis certificados.',
          'Si ya había aprobado y se agregaron niveles después: Ver estudio para revisar el material.',
        ],
      },
      'No es posible enviar el cuestionario sin completar el estudio cuando la inducción tiene módulos.',
    ],
  },
  {
    slug: 'ingresar-empresa-empleado',
    tipo: 'documentacion',
    categoria: 'Acceso',
    titulo: 'Ingresar como empresa o como empleado',
    resumen: 'La diferencia entre ambos accesos y a qué panel llega cada uno.',
    fecha: '2026-11-11',
    minutos: 2,
    cuerpo: [
      'En la pantalla de ingreso hay dos opciones.',
      {
        lista: [
          'Empresa: administra Programas, Equipo, Avances y Configuración (`/dashboard`).',
          'Empleado: estudia, rinde y descarga constancias (`/empleado`).',
        ],
      },
      'En ambos casos se ingresa el correo y luego se verifica con un código o con contraseña. No hay registro público: los accesos los crea la empresa o Inducta según el plan.',
    ],
  },
  {
    slug: 'codigo-verificacion',
    tipo: 'documentacion',
    categoria: 'Acceso',
    titulo: 'No me llega el código de verificación',
    resumen: 'Qué revisar si el código para ingresar no aparece en su correo.',
    fecha: '2026-11-11',
    minutos: 2,
    cuerpo: [
      'Al ingresar con su correo, Inducta Chile le envía un código para verificar que es usted. En dispositivos nuevos también puede pedirse un código tras la contraseña (confianza del dispositivo).',
      {
        lista: [
          'Revise las carpetas de spam y promociones.',
          'Confirme que escribió bien el correo en la pantalla de ingreso.',
          'Espere a que termine la cuenta regresiva y presione Reenviar código.',
          'Si su cuenta tiene contraseña, también puede ingresar con ella.',
        ],
      },
      'Si después de esto el código sigue sin llegar, escríbanos desde Contacto o Soporte.',
    ],
  },
  {
    slug: 'leer-el-avance',
    tipo: 'documentacion',
    categoria: 'Panel de empresa',
    titulo: 'Cómo leer Avances del equipo',
    resumen: 'Estados, notas y exportación desde Programas.',
    fecha: '2026-11-11',
    minutos: 3,
    cuerpo: [
      'En Dashboard → Programas → Avances ve una matriz de trabajadores e inducciones (sin incluir administradores de la empresa).',
      {
        lista: [
          'Pendiente: aún no inicia.',
          'En curso: estudiando o con intento abierto.',
          'Aprobada / Reprobada: con puntaje según la exigencia del programa.',
        ],
      },
      'Puede exportar un CSV de evidencias desde esa misma sección. Si un número no calza, confirme que la inducción esté Publicada y que la persona sea miembro de la organización.',
    ],
  },
  {
    slug: 'constancias',
    tipo: 'documentacion',
    categoria: 'Evidencia',
    titulo: 'Constancias al aprobar',
    resumen: 'Dónde se ven y qué muestran según el plan.',
    fecha: '2026-11-11',
    minutos: 2,
    cuerpo: [
      'Cuando un colaborador aprueba una inducción, puede abrir Constancia desde Mis programas o Mis certificados.',
      {
        lista: [
          'Plan Demostración: constancia con marca Inducta.',
          'Básico, Plus y Plus+: identidad corporativa de la empresa (logo de la organización cuando esté disponible).',
        ],
      },
      'La nota mostrada es la obtenida en el cuestionario; no se inventa un 100 % si faltan datos.',
    ],
  },
  {
    slug: 'planes-y-pago',
    tipo: 'documentacion',
    categoria: 'Planes y pago',
    titulo: 'Planes, límites y pago con Webpay',
    resumen: 'Cupos por plan, facturación en UF e IVA, y qué pasa si el pago no se completa.',
    fecha: '2026-11-11',
    minutos: 4,
    cuerpo: [
      'Los planes se eligen en Precios (mensual o anual). El valor se expresa en UF y el total a pagar incluye IVA (19 %). El monto definitivo lo calcula el servidor al iniciar Webpay.',
      { h: 'Límites orientativos' },
      {
        lista: [
          'Demostración: hasta 5 colaboradores y 1 evaluación (no contratible desde el sitio).',
          'Empresa Básico: hasta 50 colaboradores y 5 evaluaciones.',
          'Empresa Plus: hasta 250 colaboradores y evaluaciones sin límite.',
          'Empresa Plus+: colaboradores y evaluaciones sin límite.',
        ],
      },
      {
        lista: [
          'Pago exitoso: confirmación y acceso (cuenta temporal o renovación según el caso).',
          'Pago rechazado o anulado: no se realiza el cargo; puede intentarlo de nuevo.',
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
          to: `/recursos/soporte`,
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
  if (buscar('documentacion', 'WEBPAY').length < 1) throw new Error('recursos: búsqueda sin mayúsculas')
  if (buscar('guias', 'FISCALIZACION')[0]?.slug !== 'induccion-seguridad') throw new Error('recursos: tildes')
  if (buscar('guias', 'webpay').length !== 0) throw new Error('recursos: filtra por tipo')
  if (buscar('guias', '').length !== 4) throw new Error('recursos: consulta vacía guias')
  if (buscar('documentacion', '').length !== 8) throw new Error('recursos: consulta vacía documentacion')
  if (buscar('documentacion', 'codigo')[0]?.slug !== 'codigo-verificacion') throw new Error('recursos: título primero')
  if (buscar('documentacion', 'youtube')[0]?.slug !== 'niveles-de-estudio') throw new Error('recursos: niveles')
  if (buscarTodo('webpay').length < 1) throw new Error('recursos: buscarTodo webpay')
  if (buscarTodo('capacitacion').some((r) => r.slug === 'capacitaciones') === false)
    throw new Error('recursos: buscarTodo páginas')
}
