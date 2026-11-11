import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
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
import { Award, CheckCircle2, ChevronRight, RotateCcw, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  iniciarEvaluacion,
  responderEvaluacion,
} from '../../features/programas/programasService'
import { useSupabase } from '../../hooks/useSupabase'

export default function RendirEvaluacionModal({
  isOpen,
  onClose,
  test,
  idEmpresa,
  user,
  onEvaluacionFinalizada,
  onAbrirCertificado,
}) {
  const supabase = useSupabase()
  const toast = useToast()

  const [respuestas, setRespuestas] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState(null)

  // Al abrir el modal, pasar el estado a 'en_curso' (HU-12)
  useEffect(() => {
    if (isOpen && test && idEmpresa && user?.id) {
      setRespuestas({})
      setResultado(null)
      iniciarEvaluacion(supabase, {
        id_test: test.id_test,
        id_empresa: idEmpresa,
        id_usuario: user.id,
        test_titulo: test.titulo,
        nombre_usuario: user.fullName || user.firstName || 'Colaborador',
      }).catch((e) => console.warn('Aviso inicio evaluación:', e?.message))
    }
  }, [isOpen, test, idEmpresa, user, supabase])

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
      })

      setResultado(res)
      if (onEvaluacionFinalizada) {
        onEvaluacionFinalizada(res)
      }
    } catch (err) {
      toast({
        title: 'Error al enviar evaluación',
        description: err.message,
        status: 'error',
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
              <Text fontSize="md" fontWeight="bold" color="brand.ink">
                {test.titulo}
              </Text>
              <Text fontSize="xs" color="blackAlpha.600" mt={0.5}>
                Exigencia mínima: <strong>{porcentajeMinimo}%</strong> de aciertos
              </Text>
            </Box>
            <Badge colorScheme="blue" fontSize="xs" px={2} py={0.5} borderRadius="full">
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
                <Heading fontSize="xl" color="brand.ink" mb={2}>
                  {resultado.aprobada ? '¡Felicitaciones! Has Aprobado' : 'No alcanzaste la nota mínima'}
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
                  <Text fontSize="xl" fontWeight="bold" color="brand.ink">
                    {resultado.correctas} / {resultado.total}
                  </Text>
                </Box>
                <Divider orientation="vertical" h="40px" />
                <Box>
                  <Text fontSize="xs" color="blackAlpha.500">
                    Tu Nota
                  </Text>
                  <Text
                    fontSize="xl"
                    fontWeight="bold"
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
                  <Text fontSize="xl" fontWeight="bold" color="brand.ink">
                    {porcentajeMinimo}%
                  </Text>
                </Box>
              </Flex>

              {resultado.aprobada ? (
                <Button
                  colorScheme="green"
                  bg="green.600"
                  _hover={{ bg: 'green.700' }}
                  leftIcon={<Award size={18} />}
                  onClick={() => {
                    onClose()
                    if (onAbrirCertificado) onAbrirCertificado(resultado.avance)
                  }}
                >
                  Ver y Descargar Certificado
                </Button>
              ) : (
                <Button
                  variant="outline"
                  leftIcon={<RotateCcw size={16} />}
                  onClick={handleReintentar}
                >
                  Reintentar evaluación
                </Button>
              )}
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
                  colorScheme="blue"
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
                      bg={valorSeleccionado ? 'blue.50' : 'white'}
                      transition="all 0.2s"
                    >
                      <Flex align="flex-start" gap={3} mb={3}>
                        <Badge
                          colorScheme={valorSeleccionado ? 'blue' : 'gray'}
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
                              colorScheme="blue"
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
              <Button size="sm" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                size="sm"
                variant="solid"
                bg="brand.primary"
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
