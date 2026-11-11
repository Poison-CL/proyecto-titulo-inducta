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
import { useState } from 'react'
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
  const [guardando, setGuardando] = useState(false)

  const puedeCrear = puedeCrearEvaluacion(plan, totalActuales)

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
      })

      toast({
        title: 'Evaluación creada exitosamente',
        description: `Se configuró "${titulo}" con ${preguntas.length} preguntas de inducción.`,
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
              <Icon as={ClipboardList} color="brand.primary" boxSize={5} />
              <Text fontSize="md" fontWeight="bold" color="brand.ink">
                Nueva Evaluación de Inducción
              </Text>
            </Flex>
            <Button
              size="xs"
              variant="outline"
              colorScheme="purple"
              leftIcon={<Sparkles size={13} />}
              onClick={handleCargarEjemplo}
            >
              Cargar inducción sugerida
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
              <Heading fontSize="sm" color="brand.ink" mb={4} textTransform="uppercase" letterSpacing="0.05em">
                1. Datos del Programa
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

            {/* Constructor de Preguntas (HU-11) */}
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Box>
                  <Heading fontSize="sm" color="brand.ink" textTransform="uppercase" letterSpacing="0.05em">
                    2. Cuestionario de Evaluación ({preguntas.length} preguntas)
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
              variant="solid"
              bg="brand.primary"
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
