import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  Stack,
  Text,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { Check, ClipboardList, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  crearEvaluacion,
  EVALUACION_SEMILLA_DEFAULT,
} from '../../features/programas/programasService'
import { useSupabase } from '../../hooks/useSupabase'
import { puedeCrearEvaluacion } from '../../lib/planes'

export default function CrearEvaluacionModal({
  isOpen,
  onClose,
  idEmpresa,
  plan,
  totalActuales = 0,
  onEvaluacionCreada,
}) {
  const supabase = useSupabase()
  const toast = useToast()

  const [titulo, setTitulo] = useState('')
  const [porcentajeMinimo, setPorcentajeMinimo] = useState(75)
  const [preguntas, setPreguntas] = useState([
    {
      id_temp: 1,
      enunciado: '',
      opciones: [
        { id_temp: 1, texto_opcion: '', es_correcta: true },
        { id_temp: 2, texto_opcion: '', es_correcta: false },
        { id_temp: 3, texto_opcion: '', es_correcta: false },
      ],
    },
  ])
  const [modulos, setModulos] = useState([])
  const [guardando, setGuardando] = useState(false)

  const nuevoId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

  const handleAgregarNivel = () => {
    setModulos((prev) => [
      ...prev,
      {
        id: nuevoId(),
        titulo: `Nivel ${prev.length + 1}`,
        lecciones: [{ id: nuevoId(), titulo: 'Lección 1', items: [] }],
      },
    ])
  }

  const handleEliminarNivel = (nIdx) => {
    setModulos((prev) => prev.filter((_, i) => i !== nIdx))
  }

  const handleTituloNivel = (nIdx, titulo) => {
    setModulos((prev) => prev.map((n, i) => (i === nIdx ? { ...n, titulo } : n)))
  }

  const handleAgregarLeccion = (nIdx) => {
    setModulos((prev) =>
      prev.map((n, i) =>
        i === nIdx
          ? {
              ...n,
              lecciones: [
                ...(n.lecciones || []),
                {
                  id: nuevoId(),
                  titulo: `Lección ${(n.lecciones || []).length + 1}`,
                  items: [],
                },
              ],
            }
          : n,
      ),
    )
  }

  const handleEliminarLeccion = (nIdx, lIdx) => {
    setModulos((prev) =>
      prev.map((n, i) =>
        i === nIdx
          ? { ...n, lecciones: (n.lecciones || []).filter((_, j) => j !== lIdx) }
          : n,
      ),
    )
  }

  const handleTituloLeccion = (nIdx, lIdx, titulo) => {
    setModulos((prev) =>
      prev.map((n, i) => {
        if (i !== nIdx) return n
        const lecciones = (n.lecciones || []).map((l, j) => (j === lIdx ? { ...l, titulo } : l))
        return { ...n, lecciones }
      }),
    )
  }

  const handleAgregarItem = (nIdx, lIdx, tipo) => {
    setModulos((prev) =>
      prev.map((n, i) => {
        if (i !== nIdx) return n
        const lecciones = (n.lecciones || []).map((l, j) =>
          j === lIdx
            ? {
                ...l,
                items: [
                  ...(l.items || []),
                  tipo === 'youtube'
                    ? { id: nuevoId(), tipo: 'youtube', titulo: '', url: '', descripcion: '' }
                    : { id: nuevoId(), tipo: 'texto', titulo: '', cuerpo: '' },
                ],
              }
            : l,
        )
        return { ...n, lecciones }
      }),
    )
  }

  const handleItemChange = (nIdx, lIdx, iIdx, patch) => {
    setModulos((prev) =>
      prev.map((n, i) => {
        if (i !== nIdx) return n
        const lecciones = (n.lecciones || []).map((l, j) => {
          if (j !== lIdx) return l
          const items = (l.items || []).map((it, k) => (k === iIdx ? { ...it, ...patch } : it))
          return { ...l, items }
        })
        return { ...n, lecciones }
      }),
    )
  }

  const handleEliminarItem = (nIdx, lIdx, iIdx) => {
    setModulos((prev) =>
      prev.map((n, i) => {
        if (i !== nIdx) return n
        const lecciones = (n.lecciones || []).map((l, j) =>
          j === lIdx ? { ...l, items: (l.items || []).filter((_, k) => k !== iIdx) } : l,
        )
        return { ...n, lecciones }
      }),
    )
  }

  const puedeCrear = puedeCrearEvaluacion(plan, totalActuales)

  useEffect(() => {
    if (!isOpen) return
    setTitulo('')
    setPorcentajeMinimo(75)
    setModulos([])
    setPreguntas([
      {
        id_temp: 1,
        enunciado: '',
        opciones: [
          { id_temp: 1, texto_opcion: '', es_correcta: true },
          { id_temp: 2, texto_opcion: '', es_correcta: false },
          { id_temp: 3, texto_opcion: '', es_correcta: false },
        ],
      },
    ])
  }, [isOpen])

  const handleCargarEjemplo = () => {
    setTitulo(EVALUACION_SEMILLA_DEFAULT.titulo)
    setPorcentajeMinimo(EVALUACION_SEMILLA_DEFAULT.porcentaje_aprobacion)
    setPreguntas(
      EVALUACION_SEMILLA_DEFAULT.preguntas.map((p, idx) => ({
        id_temp: idx + 1,
        enunciado: p.enunciado,
        opciones: p.opciones.map((o, oIdx) => ({
          id_temp: oIdx + 1,
          texto_opcion: o.texto_opcion,
          es_correcta: o.es_correcta,
        })),
      })),
    )
    toast({
      title: 'Ejemplo cargado',
      description: 'Se cargaron 4 preguntas de inducción de seguridad laboral listas para guardar o personalizar.',
      status: 'info',
      duration: 3000,
    })
  }

  const handleAgregarPregunta = () => {
    setPreguntas((prev) => [
      ...prev,
      {
        id_temp: Date.now(),
        enunciado: '',
        opciones: [
          { id_temp: 1, texto_opcion: '', es_correcta: true },
          { id_temp: 2, texto_opcion: '', es_correcta: false },
          { id_temp: 3, texto_opcion: '', es_correcta: false },
        ],
      },
    ])
  }

  const handleEliminarPregunta = (pIdx) => {
    if (preguntas.length <= 1) {
      toast({
        title: 'Mínimo de preguntas',
        description: 'La evaluación debe tener al menos una pregunta.',
        status: 'warning',
      })
      return
    }
    setPreguntas((prev) => prev.filter((_, idx) => idx !== pIdx))
  }

  const handleEnunciadoChange = (pIdx, texto) => {
    setPreguntas((prev) =>
      prev.map((p, idx) => (idx === pIdx ? { ...p, enunciado: texto } : p)),
    )
  }

  const handleTextoOpcionChange = (pIdx, oIdx, texto) => {
    setPreguntas((prev) =>
      prev.map((p, idx) => {
        if (idx !== pIdx) return p
        const opcionesActualizadas = p.opciones.map((opt, optIdx) =>
          optIdx === oIdx ? { ...opt, texto_opcion: texto } : opt,
        )
        return { ...p, opciones: opcionesActualizadas }
      }),
    )
  }

  const handleMarcarCorrecta = (pIdx, oIdx) => {
    setPreguntas((prev) =>
      prev.map((p, idx) => {
        if (idx !== pIdx) return p
        const opcionesActualizadas = p.opciones.map((opt, optIdx) => ({
          ...opt,
          es_correcta: optIdx === oIdx,
        }))
        return { ...p, opciones: opcionesActualizadas }
      }),
    )
  }

  const handleAgregarOpcion = (pIdx) => {
    setPreguntas((prev) =>
      prev.map((p, idx) => {
        if (idx !== pIdx) return p
        return {
          ...p,
          opciones: [
            ...p.opciones,
            { id_temp: Date.now(), texto_opcion: '', es_correcta: false },
          ],
        }
      }),
    )
  }

  const handleEliminarOpcion = (pIdx, oIdx) => {
    setPreguntas((prev) =>
      prev.map((p, idx) => {
        if (idx !== pIdx) return p
        if (p.opciones.length <= 2) {
          toast({
            title: 'Mínimo de opciones',
            description: 'Cada pregunta debe tener al menos 2 alternativas.',
            status: 'warning',
          })
          return p
        }
        const filtradas = p.opciones.filter((_, optIdx) => optIdx !== oIdx)
        // Asegurar que al menos una quede marcada como correcta
        const algunaCorrecta = filtradas.some((o) => o.es_correcta)
        if (!algunaCorrecta && filtradas.length > 0) {
          filtradas[0].es_correcta = true
        }
        return { ...p, opciones: filtradas }
      }),
    )
  }

  const handleGuardar = async () => {
    if (!puedeCrear) {
      toast({
        title: 'Tope de plan alcanzado',
        description: 'Su plan actual no permite crear más evaluaciones. Actualice su suscripción.',
        status: 'error',
      })
      return
    }

    if (!titulo.trim()) {
      toast({
        title: 'Título requerido',
        description: 'Por favor asigne un nombre a la evaluación o programa.',
        status: 'warning',
      })
      return
    }

    for (let n = 0; n < modulos.length; n++) {
      const nivel = modulos[n]
      if (!nivel.titulo?.trim()) {
        toast({
          title: `Nivel ${n + 1}`,
          description: 'Asigne un título al nivel de estudio.',
          status: 'warning',
        })
        return
      }
      if (!nivel.lecciones?.length) {
        toast({
          title: `Nivel ${n + 1}`,
          description: 'Agregue al menos una lección.',
          status: 'warning',
        })
        return
      }
      for (let l = 0; l < nivel.lecciones.length; l++) {
        const lec = nivel.lecciones[l]
        if (!lec.titulo?.trim()) {
          toast({
            title: `Nivel ${n + 1}, lección ${l + 1}`,
            description: 'Asigne un título a la lección.',
            status: 'warning',
          })
          return
        }
        for (let i = 0; i < (lec.items || []).length; i++) {
          const it = lec.items[i]
          if (it.tipo === 'youtube') {
            if (!String(it.url || '').trim()) {
              toast({
                title: `Nivel ${n + 1} · Lección ${l + 1} · video`,
                description: 'Pegue el enlace de YouTube.',
                status: 'warning',
              })
              return
            }
          } else if (!String(it.cuerpo || '').trim()) {
            toast({
              title: `Nivel ${n + 1} · Lección ${l + 1} · texto`,
              description: 'Escriba el contenido de estudio.',
              status: 'warning',
            })
            return
          }
        }
      }
    }

    // Validar preguntas
    for (let i = 0; i < preguntas.length; i++) {
      const p = preguntas[i]
      if (!p.enunciado.trim()) {
        toast({
          title: `Pregunta ${i + 1} incompleta`,
          description: 'Escriba el enunciado de la pregunta.',
          status: 'warning',
        })
        return
      }

      for (let j = 0; j < p.opciones.length; j++) {
        if (!p.opciones[j].texto_opcion.trim()) {
          toast({
            title: `Pregunta ${i + 1}, opción ${j + 1}`,
            description: 'Escriba el texto de todas las alternativas.',
            status: 'warning',
          })
          return
        }
      }

      const tieneCorrecta = p.opciones.some((o) => o.es_correcta)
      if (!tieneCorrecta) {
        toast({
          title: `Pregunta ${i + 1}`,
          description: 'Marque cuál alternativa es la correcta.',
          status: 'warning',
        })
        return
      }
    }

    setGuardando(true)
    try {
      const res = await crearEvaluacion(supabase, {
        id_empresa: idEmpresa,
        titulo: titulo.trim(),
        porcentaje_aprobacion: Number(porcentajeMinimo) || 75,
        estado: 'activo',
        preguntas,
        modulos: modulos.map((n) => ({
          id: n.id,
          titulo: n.titulo.trim(),
          lecciones: (n.lecciones || []).map((l) => ({
            id: l.id,
            titulo: l.titulo.trim(),
            items: (l.items || []).map((it) =>
              it.tipo === 'youtube'
                ? {
                    id: it.id,
                    tipo: 'youtube',
                    titulo: (it.titulo || '').trim(),
                    url: String(it.url || '').trim(),
                    descripcion: String(it.descripcion || '').trim(),
                  }
                : {
                    id: it.id,
                    tipo: 'texto',
                    titulo: (it.titulo || '').trim(),
                    cuerpo: String(it.cuerpo || '').trim(),
                  },
            ),
          })),
        })),
      })

      toast({
        title: 'Evaluación creada exitosamente',
        description: `Se configuró "${titulo}" con ${modulos.length} nivel(es) y ${preguntas.length} preguntas.`,
        status: 'success',
        duration: 4000,
      })

      if (onEvaluacionCreada) {
        onEvaluacionCreada(res.evaluacion)
      }
      onClose()
    } catch (err) {
      toast({
        title: 'Error al crear evaluación',
        description: err.message,
        status: 'error',
      })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside" isCentered>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(2px)" />
      <ModalContent borderRadius="2xl" overflow="hidden">
        <ModalHeader borderBottomWidth="1px" borderColor="blackAlpha.100" py={4} bg="brand.soft">
          <Flex align="center" justify="space-between" pr={6}>
            <Flex align="center" gap={2}>
              <Icon as={ClipboardList} color="brand.primary" boxSize={5} strokeWidth={1.75} />
              <Text fontSize="md" fontWeight="semibold" letterSpacing="-0.02em" color="brand.ink">
                Nueva evaluación
              </Text>
            </Flex>
            <Button
              size="xs"
              h="28px"
              variant="outline"
              leftIcon={<Sparkles size={13} />}
              onClick={handleCargarEjemplo}
            >
              Inducción sugerida
            </Button>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={{ base: 4, md: 6 }}>
          {!puedeCrear && (
            <Alert status="error" borderRadius="xl" mb={6}>
              <AlertIcon />
              <AlertDescription fontSize="sm">
                Ha alcanzado el tope de evaluaciones de su plan (
                {plan?.nombre || 'Demostración'}: máximo {plan?.maxEvaluaciones ?? 1}).
                Para agregar más programas, actualice su plan en Configuración.
              </AlertDescription>
            </Alert>
          )}

          <VStack spacing={6} align="stretch">
            {/* Datos generales de la prueba */}
            <Box p={5} borderWidth="1px" borderColor="blackAlpha.100" borderRadius="xl" bg="white">
              <Heading fontSize="sm" fontWeight="semibold" color="brand.ink" mb={4} textTransform="uppercase" letterSpacing="0.05em">
                1. Datos del programa
              </Heading>

              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Título de la inducción o capacitación
                  </FormLabel>
                  <Input
                    placeholder="Ej: Inducción General de Seguridad y Prevención de Riesgos"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                  />
                  <FormHelperText fontSize="xs">
                    Nombre oficial con el que se emitirá la constancia y certificados.
                  </FormHelperText>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold">
                    Exigencia mínima de aprobación (% aciertos)
                  </FormLabel>
                  <HStack maxW="200px">
                    <NumberInput
                      min={50}
                      max={100}
                      step={5}
                      value={porcentajeMinimo}
                      onChange={(val) => setPorcentajeMinimo(Number(val))}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Text fontSize="sm" fontWeight="bold" color="blackAlpha.700">
                      %
                    </Text>
                  </HStack>
                  <FormHelperText fontSize="xs">
                    Porcentaje mínimo de respuestas correctas para aprobar (HU-11). Típicamente entre 70% y 80%.
                  </FormHelperText>
                </FormControl>
              </Stack>
            </Box>

            <Box p={5} borderWidth="1px" borderColor="blackAlpha.100" borderRadius="xl" bg="white">
              <Flex justify="space-between" align="center" mb={3}>
                <Box>
                  <Heading
                    fontSize="sm"
                    fontWeight="semibold"
                    color="brand.ink"
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                  >
                    2. Niveles de estudio ({modulos.length})
                  </Heading>
                  <Text fontSize="xs" color="blackAlpha.600" mt={0.5}>
                    Estructura Nivel → Lección → video/texto. Completar el estudio desbloquea el
                    cuestionario. Opcional.
                  </Text>
                </Box>
                <Button size="sm" variant="outline" leftIcon={<Plus size={15} />} onClick={handleAgregarNivel}>
                  Agregar nivel
                </Button>
              </Flex>

              <VStack spacing={4} align="stretch">
                {modulos.length === 0 ? (
                  <Text fontSize="sm" color="blackAlpha.500">
                    Sin niveles: el cuestionario queda disponible de inmediato.
                  </Text>
                ) : (
                  modulos.map((nivel, nIdx) => (
                    <Box
                      key={nivel.id}
                      p={4}
                      borderWidth="1px"
                      borderColor="blackAlpha.100"
                      borderRadius="lg"
                      bg="brand.soft"
                    >
                      <Flex gap={2} align="center" mb={3}>
                        <Input
                          size="sm"
                          bg="white"
                          value={nivel.titulo}
                          onChange={(e) => handleTituloNivel(nIdx, e.target.value)}
                          placeholder={`Nivel ${nIdx + 1}`}
                        />
                        <IconButton
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          icon={<Trash2 size={14} />}
                          aria-label="Eliminar nivel"
                          onClick={() => handleEliminarNivel(nIdx)}
                        />
                      </Flex>

                      <Button
                        size="xs"
                        variant="outline"
                        mb={3}
                        leftIcon={<Plus size={12} />}
                        onClick={() => handleAgregarLeccion(nIdx)}
                      >
                        Agregar lección
                      </Button>

                      <VStack spacing={3} align="stretch">
                        {(nivel.lecciones || []).map((lec, lIdx) => (
                          <Box
                            key={lec.id}
                            p={3}
                            bg="white"
                            borderRadius="md"
                            borderWidth="1px"
                            borderColor="blackAlpha.100"
                          >
                            <Flex gap={2} align="center" mb={2}>
                              <Badge fontSize="2xs">Lección {lIdx + 1}</Badge>
                              <Input
                                size="sm"
                                value={lec.titulo}
                                onChange={(e) => handleTituloLeccion(nIdx, lIdx, e.target.value)}
                                placeholder={`Lección ${lIdx + 1}`}
                              />
                              <IconButton
                                size="xs"
                                variant="ghost"
                                colorScheme="red"
                                icon={<Trash2 size={13} />}
                                aria-label="Eliminar lección"
                                onClick={() => handleEliminarLeccion(nIdx, lIdx)}
                              />
                            </Flex>
                            <HStack mb={2} spacing={2}>
                              <Button
                                size="xs"
                                variant="outline"
                                leftIcon={<Plus size={12} />}
                                onClick={() => handleAgregarItem(nIdx, lIdx, 'texto')}
                              >
                                Texto
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                leftIcon={<Plus size={12} />}
                                onClick={() => handleAgregarItem(nIdx, lIdx, 'youtube')}
                              >
                                YouTube
                              </Button>
                            </HStack>
                            <VStack spacing={2} align="stretch">
                              {(lec.items || []).map((it, iIdx) => (
                                <Box
                                  key={it.id}
                                  p={3}
                                  bg="brand.soft"
                                  borderRadius="md"
                                  borderWidth="1px"
                                  borderColor="blackAlpha.100"
                                >
                                  <Flex justify="space-between" mb={2}>
                                    <Badge fontSize="2xs">
                                      {it.tipo === 'youtube' ? 'YouTube' : 'Texto'}
                                    </Badge>
                                    <IconButton
                                      size="xs"
                                      variant="ghost"
                                      icon={<X size={13} />}
                                      aria-label="Quitar ítem"
                                      onClick={() => handleEliminarItem(nIdx, lIdx, iIdx)}
                                    />
                                  </Flex>
                                  <Input
                                    size="sm"
                                    mb={2}
                                    bg="white"
                                    placeholder="Título"
                                    value={it.titulo || ''}
                                    onChange={(e) =>
                                      handleItemChange(nIdx, lIdx, iIdx, { titulo: e.target.value })
                                    }
                                  />
                                  {it.tipo === 'youtube' ? (
                                    <>
                                      <Input
                                        size="sm"
                                        mb={2}
                                        bg="white"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={it.url || ''}
                                        onChange={(e) =>
                                          handleItemChange(nIdx, lIdx, iIdx, { url: e.target.value })
                                        }
                                      />
                                      <Textarea
                                        size="sm"
                                        rows={2}
                                        bg="white"
                                        placeholder="Descripción corta (opcional)"
                                        value={it.descripcion || ''}
                                        onChange={(e) =>
                                          handleItemChange(nIdx, lIdx, iIdx, {
                                            descripcion: e.target.value,
                                          })
                                        }
                                      />
                                    </>
                                  ) : (
                                    <Textarea
                                      size="sm"
                                      rows={3}
                                      bg="white"
                                      placeholder="Contenido de estudio..."
                                      value={it.cuerpo || ''}
                                      onChange={(e) =>
                                        handleItemChange(nIdx, lIdx, iIdx, { cuerpo: e.target.value })
                                      }
                                    />
                                  )}
                                </Box>
                              ))}
                            </VStack>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  ))
                )}
              </VStack>
            </Box>

            {/* Constructor de Preguntas (HU-11) */}
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Box>
                  <Heading fontSize="sm" fontWeight="semibold" color="brand.ink" textTransform="uppercase" letterSpacing="0.05em">
                    3. Cuestionario ({preguntas.length} preguntas)
                  </Heading>
                  <Text fontSize="xs" color="blackAlpha.600" mt={0.5}>
                    Cargue alternativas de opción múltiple y seleccione la respuesta correcta (HU-11).
                  </Text>
                </Box>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus size={15} />}
                  onClick={handleAgregarPregunta}
                >
                  Agregar pregunta
                </Button>
              </Flex>

              <VStack spacing={5} align="stretch">
                {preguntas.map((preg, pIdx) => (
                  <Box
                    key={preg.id_temp || pIdx}
                    p={5}
                    borderWidth="1px"
                    borderColor="blackAlpha.150"
                    borderRadius="xl"
                    bg="brand.soft"
                  >
                    <Flex justify="space-between" align="center" mb={3}>
                      <Badge colorScheme="blue" borderRadius="full" px={2.5} py={0.5} fontSize="xs">
                        Pregunta {pIdx + 1}
                      </Badge>
                      <IconButton
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        icon={<Trash2 size={14} />}
                        aria-label="Eliminar pregunta"
                        onClick={() => handleEliminarPregunta(pIdx)}
                      />
                    </Flex>

                    <FormControl isRequired mb={4}>
                      <FormLabel fontSize="xs" color="blackAlpha.700">
                        Enunciado de la pregunta
                      </FormLabel>
                      <Textarea
                        rows={2}
                        bg="white"
                        placeholder="Ej: ¿Cuál es el procedimiento inmediato en caso de sismo o emergencia?"
                        value={preg.enunciado}
                        onChange={(e) => handleEnunciadoChange(pIdx, e.target.value)}
                      />
                    </FormControl>

                    <Box>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontSize="xs" fontWeight="semibold" color="blackAlpha.600">
                          Alternativas (marque el radio de la respuesta correcta)
                        </Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          leftIcon={<Plus size={12} />}
                          onClick={() => handleAgregarOpcion(pIdx)}
                        >
                          Añadir opción
                        </Button>
                      </Flex>

                      <VStack spacing={2} align="stretch">
                        {preg.opciones.map((opt, oIdx) => (
                          <Flex
                            key={opt.id_temp || oIdx}
                            align="center"
                            gap={2.5}
                            p={2}
                            borderRadius="lg"
                            bg="white"
                            borderWidth="1px"
                            borderColor={opt.es_correcta ? 'green.300' : 'blackAlpha.100'}
                          >
                            <Radio
                              isChecked={opt.es_correcta}
                              colorScheme="green"
                              onChange={() => handleMarcarCorrecta(pIdx, oIdx)}
                              title="Marcar como alternativa correcta"
                            />
                            <Input
                              size="sm"
                              placeholder={`Opción ${oIdx + 1}`}
                              value={opt.texto_opcion}
                              variant="unstyled"
                              px={2}
                              onChange={(e) =>
                                handleTextoOpcionChange(pIdx, oIdx, e.target.value)
                              }
                            />
                            {opt.es_correcta && (
                              <Badge colorScheme="green" fontSize="2xs" px={2} py={0.5}>
                                Correcta
                              </Badge>
                            )}
                            <IconButton
                              size="xs"
                              variant="ghost"
                              colorScheme="gray"
                              icon={<X size={13} />}
                              aria-label="Quitar opción"
                              onClick={() => handleEliminarOpcion(pIdx, oIdx)}
                            />
                          </Flex>
                        ))}
                      </VStack>
                    </Box>
                  </Box>
                ))}
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor="blackAlpha.100" py={3} bg="brand.soft">
          <Flex w="full" justify="space-between" align="center">
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              size="sm"
              h="36px"
              isDisabled={!puedeCrear}
              isLoading={guardando}
              loadingText="Guardando..."
              leftIcon={<Check size={16} />}
              onClick={handleGuardar}
            >
              Guardar evaluación
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
