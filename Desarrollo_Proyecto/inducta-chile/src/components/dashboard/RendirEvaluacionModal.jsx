import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { Award, CheckCircle2, ChevronRight, RotateCcw, TrendingUp, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  iniciarEvaluacion,
  modulosCompletos,
  responderEvaluacion,
} from '../../features/programas/programasService'
import { useSupabase } from '../../hooks/useSupabase'

export default function RendirEvaluacionModal({
  isOpen,
  onClose,
  test,
  idEmpresa,
  user,
  avance = null,
  onEvaluacionFinalizada,
  onAbrirCertificado,
  onRequiereEstudio,
}) {
  const supabase = useSupabase()
  const toast = useToast()
  const navigate = useNavigate()

  const [respuestas, setRespuestas] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const sesionIniciada = useRef(null)

  // Solo reinicia al abrir un test nuevo — no cuando el padre refresca datos tras enviar.
  useEffect(() => {
    if (!isOpen || !test?.id_test || !idEmpresa || !user?.id) return
    const clave = `${idEmpresa}:${test.id_test}:${user.id}`
    if (sesionIniciada.current === clave) return

    if (!modulosCompletos(test.modulos, avance?.progreso_modulos)) {
      toast({
        title: 'Estudio incompleto',
        description: 'Complete todos los niveles antes de rendir la evaluación.',
        status: 'warning',
        duration: 5000,
      })
      onRequiereEstudio?.(test)
      onClose?.()
      return
    }

    sesionIniciada.current = clave
    setRespuestas({})
    setResultado(null)
    iniciarEvaluacion(supabase, {
      id_test: test.id_test,
      id_empresa: idEmpresa,
      id_usuario: user.id,
      test_titulo: test.titulo,
      nombre_usuario: user.fullName || user.firstName || 'Colaborador',
      modulos: test.modulos,
    }).catch((e) => {
      if (e?.code === 'ESTUDIO_INCOMPLETO') {
        toast({
          title: 'Estudio incompleto',
          description: e.message,
          status: 'warning',
          duration: 5000,
        })
        onRequiereEstudio?.(test)
        onClose?.()
        return
      }
      console.warn('Aviso inicio evaluación:', e?.message)
    })
  }, [
    isOpen,
    test,
    avance?.progreso_modulos,
    idEmpresa,
    user?.id,
    user?.fullName,
    user?.firstName,
    supabase,
    toast,
    onClose,
    onRequiereEstudio,
  ])

  useEffect(() => {
    if (!isOpen) sesionIniciada.current = null
  }, [isOpen])

  if (!test) return null

  const preguntas = test.preguntas || []
  const totalPreguntas = preguntas.length
  const respondidas = Object.keys(respuestas).length
  const porcentajeRespondido = totalPreguntas > 0 ? (respondidas / totalPreguntas) * 100 : 0
  const porcentajeMinimo = test.porcentaje_aprobacion || 70

  const handleSeleccionarRespuesta = (idPregunta, idOpcion) => {
    setRespuestas((prev) => ({
      ...prev,
      [idPregunta]: Number(idOpcion),
    }))
  }

  const handleEnviar = async () => {
    if (respondidas < totalPreguntas) {
      toast({
        title: 'Respuestas incompletas',
        description: `Por favor responde todas las preguntas (${respondidas} de ${totalPreguntas}) antes de enviar.`,
        status: 'warning',
        duration: 3500,
        isClosable: true,
      })
      return
    }

    setEnviando(true)
    try {
      const res = await responderEvaluacion(supabase, {
        id_test: test.id_test,
        id_empresa: idEmpresa,
        id_usuario: user.id,
        respuestasSeleccionadas: respuestas,
        preguntas,
        test_titulo: test.titulo,
        nombre_usuario: user.fullName || user.firstName || 'Colaborador',
        porcentaje_minimo: porcentajeMinimo,
        modulos: test.modulos,
      })

      if (!res?.ok || res.porcentajeObtenido == null) {
        throw new Error(res?.errorNube || 'No se pudo calificar la evaluación')
      }
      setResultado(res)
      if (res?.persistidoEnNube === false) {
        toast({
          title: 'Nota guardada en este dispositivo',
          description:
            res.errorNube ||
            'No se pudo publicar en la nube. Abra Mis programas de nuevo para reintentar la sincronización (el admin no la verá hasta entonces).',
          status: 'warning',
          duration: 7000,
          isClosable: true,
        })
      }
      if (onEvaluacionFinalizada) {
        onEvaluacionFinalizada(res)
      }
    } catch (err) {
      toast({
        title: 'Error al enviar evaluación',
        description: err.message || 'No se pudo enviar la evaluación',
        status: 'error',
        duration: 7000,
        isClosable: true,
      })
    } finally {
      setEnviando(false)
    }
  }

  const handleReintentar = () => {
    setRespuestas({})
    setResultado(null)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside" isCentered>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(2px)" />
      <ModalContent borderRadius="2xl" overflow="hidden">
        <ModalHeader borderBottomWidth="1px" borderColor="blackAlpha.100" py={4} bg="brand.soft">
          <Flex align="center" justify="space-between" pr={6}>
            <Box>
              <Text fontSize="md" fontWeight="semibold" letterSpacing="-0.02em" color="brand.ink">
                {test.titulo}
              </Text>
              <Text fontSize="xs" color="blackAlpha.600" mt={0.5}>
                Exigencia mínima: <strong>{porcentajeMinimo}%</strong> de aciertos
              </Text>
            </Box>
            <Badge
              bg="brand.wash"
              color="brand.primary"
              fontSize="xs"
              px={2.5}
              py={0.5}
              borderRadius="full"
              fontWeight="semibold"
            >
              {totalPreguntas} preguntas
            </Badge>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={{ base: 4, md: 6 }}>
          {/* Pantalla de Resultado (HU-12) */}
          {resultado ? (
            <VStack spacing={6} py={6} textAlign="center">
              <Flex
                w="64px"
                h="64px"
                borderRadius="full"
                align="center"
                justify="center"
                bg={resultado.aprobada ? 'green.50' : 'orange.50'}
                borderWidth="2px"
                borderColor={resultado.aprobada ? 'green.400' : 'orange.400'}
              >
                <Icon
                  as={resultado.aprobada ? CheckCircle2 : XCircle}
                  boxSize={8}
                  color={resultado.aprobada ? 'green.600' : 'orange.600'}
                />
              </Flex>

              <Box>
                <Heading fontSize="xl" fontWeight="semibold" letterSpacing="-0.03em" color="brand.ink" mb={2}>
                  {resultado.aprobada ? '¡Felicitaciones! Aprobaste' : 'No alcanzaste la nota mínima'}
                </Heading>
                <Text fontSize="sm" color="blackAlpha.600" maxW="40ch" mx="auto">
                  {resultado.aprobada
                    ? 'Has completado exitosamente esta inducción corporativa. Tu certificado ya está disponible.'
                    : `Obtuviste un ${resultado.porcentajeObtenido}% de aciertos. La exigencia para aprobar es de ${porcentajeMinimo}%. Puedes volver a intentarlo.`}
                </Text>
              </Box>

              {/* Tarjeta de métricas */}
              <Flex
                p={4}
                bg="brand.soft"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="blackAlpha.100"
                w="full"
                maxW="360px"
                justify="space-around"
              >
                <Box>
                  <Text fontSize="xs" color="blackAlpha.500">
                    Aciertos
                  </Text>
                  <Text fontSize="xl" fontWeight="semibold" letterSpacing="-0.03em" color="brand.ink">
                    {resultado.correctas} / {resultado.total}
                  </Text>
                </Box>
                <Divider orientation="vertical" h="40px" />
                <Box>
                  <Text fontSize="xs" color="blackAlpha.500">
                    Tu nota
                  </Text>
                  <Text
                    fontSize="xl"
                    fontWeight="semibold"
                    letterSpacing="-0.03em"
                    color={resultado.aprobada ? 'green.600' : 'orange.600'}
                  >
                    {resultado.porcentajeObtenido}%
                  </Text>
                </Box>
                <Divider orientation="vertical" h="40px" />
                <Box>
                  <Text fontSize="xs" color="blackAlpha.500">
                    Requerido
                  </Text>
                  <Text fontSize="xl" fontWeight="semibold" letterSpacing="-0.03em" color="brand.ink">
                    {porcentajeMinimo}%
                  </Text>
                </Box>
              </Flex>

              <VStack spacing={3} w="full" maxW="360px">
                {resultado.aprobada ? (
                  <Button
                    w="full"
                    h="40px"
                    leftIcon={<Award size={18} />}
                    onClick={() => {
                      onClose()
                      if (onAbrirCertificado) onAbrirCertificado(resultado.avance)
                    }}
                  >
                    Ver certificado
                  </Button>
                ) : (
                  <Button
                    w="full"
                    h="40px"
                    variant="outline"
                    leftIcon={<RotateCcw size={16} />}
                    onClick={handleReintentar}
                  >
                    Reintentar evaluación
                  </Button>
                )}
                <Button
                  w="full"
                  h="40px"
                  variant="ghost"
                  leftIcon={<TrendingUp size={16} />}
                  onClick={() => {
                    onClose()
                    navigate('/empleado/programas')
                  }}
                >
                  Ver mis programas
                </Button>
              </VStack>
            </VStack>
          ) : (
            /* Formulario de Evaluación */
            <VStack spacing={6} align="stretch">
              <Box mb={2}>
                <Flex justify="space-between" fontSize="xs" color="blackAlpha.600" mb={1.5}>
                  <Text>Progreso de respuestas</Text>
                  <Text fontWeight="semibold">
                    {respondidas} de {totalPreguntas} respondidas
                  </Text>
                </Flex>
                <Progress
                  value={porcentajeRespondido}
                  size="sm"
                  borderRadius="full"
                  sx={{ '& > div': { bg: 'brand.primary' } }}
                  bg="blackAlpha.100"
                />
              </Box>

              {preguntas.length === 0 ? (
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    Esta evaluación aún no tiene preguntas configuradas. Contacte al administrador.
                  </AlertDescription>
                </Alert>
              ) : (
                preguntas.map((preg, pIdx) => {
                  const valorSeleccionado = respuestas[preg.id_pregunta]
                    ? String(respuestas[preg.id_pregunta])
                    : ''

                  return (
                    <Box
                      key={preg.id_pregunta || pIdx}
                      p={5}
                      borderWidth="1px"
                      borderColor={valorSeleccionado ? 'brand.primary' : 'blackAlpha.100'}
                      borderRadius="xl"
                      bg={valorSeleccionado ? 'brand.wash' : 'white'}
                      transition="border-color 150ms, background-color 150ms"
                    >
                      <Flex align="flex-start" gap={3} mb={3}>
                        <Badge
                          bg={valorSeleccionado ? 'brand.primary' : 'blackAlpha.100'}
                          color={valorSeleccionado ? 'white' : 'blackAlpha.600'}
                          borderRadius="full"
                          px={2}
                          py={0.5}
                          mt={0.5}
                        >
                          {pIdx + 1}
                        </Badge>
                        <Text fontWeight="semibold" color="brand.ink" fontSize="sm">
                          {preg.enunciado}
                        </Text>
                      </Flex>

                      <RadioGroup
                        value={valorSeleccionado}
                        onChange={(val) => handleSeleccionarRespuesta(preg.id_pregunta, val)}
                      >
                        <Stack spacing={2.5} pl={8}>
                          {(preg.opciones || []).map((opt) => (
                            <Radio
                              key={opt.id_opcion}
                              value={String(opt.id_opcion)}
                              color="brand.primary"
                              size="md"
                            >
                              <Text fontSize="sm" color="brand.ink">
                                {opt.texto_opcion}
                              </Text>
                            </Radio>
                          ))}
                        </Stack>
                      </RadioGroup>
                    </Box>
                  )
                })
              )}
            </VStack>
          )}
        </ModalBody>

        {!resultado && (
          <ModalFooter borderTopWidth="1px" borderColor="blackAlpha.100" py={3} bg="brand.soft">
            <Flex w="full" justify="space-between" align="center">
              <Button size="sm" h="36px" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                size="sm"
                h="36px"
                isDisabled={respondidas < totalPreguntas || totalPreguntas === 0}
                isLoading={enviando}
                loadingText="Calificando..."
                rightIcon={<ChevronRight size={16} />}
                onClick={handleEnviar}
              >
                Enviar evaluación
              </Button>
            </Flex>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  )
}
