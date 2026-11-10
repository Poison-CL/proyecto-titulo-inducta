import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useOrganization, useUser } from '@clerk/clerk-react'
import { Award, BookOpen, CheckCircle2, Play, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import CertificadoModal from '../../components/dashboard/CertificadoModal'
import RendirEvaluacionModal from '../../components/dashboard/RendirEvaluacionModal'
import {
  getAvancesEmpleado,
  getEvaluacionConPreguntas,
  getEvaluacionesEmpresa,
} from '../../features/programas/programasService'
import { useSupabase } from '../../hooks/useSupabase'

export default function EmpleadoProgramasPage() {
  const { user } = useUser()
  const { organization } = useOrganization()
  const supabase = useSupabase()

  const [evaluaciones, setEvaluaciones] = useState([])
  const [avances, setAvances] = useState([])
  const [loading, setLoading] = useState(true)
  const [testParaRendir, setTestParaRendir] = useState(null)
  const [cargandoDetalleId, setCargandoDetalleId] = useState(null)
  const [certificadoSeleccionado, setCertificadoSeleccionado] = useState(null)

  const cargarDatos = useCallback(async () => {
    if (!organization?.id || !user?.id) return
    setLoading(true)
    try {
      const [tests, regs] = await Promise.all([
        getEvaluacionesEmpresa(supabase, organization.id),
        getAvancesEmpleado(supabase, organization.id, user.id),
      ])
      setEvaluaciones(tests.filter((t) => t.estado === 'activo'))
      setAvances(regs)
    } catch (e) {
      console.warn('Error cargando programas del empleado:', e)
    } finally {
      setLoading(false)
    }
  }, [organization?.id, user?.id, supabase])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const handleAbrirEvaluacion = async (test) => {
    setCargandoDetalleId(test.id_test)
    try {
      const detalle = await getEvaluacionConPreguntas(supabase, test.id_test, organization?.id)
      setTestParaRendir(detalle || test)
    } catch (e) {
      console.warn(e)
    } finally {
      setCargandoDetalleId(null)
    }
  }

  // Mapa de avance por id_test
  const mapaAvances = new Map(avances.map((a) => [Number(a.id_test), a]))

  return (
    <Box maxW="52rem" mx="auto">
      {/* Header */}
      <Flex align="center" gap={3} mb={2}>
        <BookOpen size={22} color="#1B22A7" strokeWidth={2} />
        <Heading
          as="h1"
          fontSize={{ base: 'xl', md: '2xl' }}
          fontWeight="semibold"
          letterSpacing="-0.02em"
          color="brand.ink"
        >
          Mis Programas de Inducción
        </Heading>
      </Flex>
      <Text color="blackAlpha.600" mb={8} fontSize="sm">
        Consulte las inducciones obligatorias y capacitaciones asignadas por{' '}
        <strong>{organization?.name || 'su empresa'}</strong>.
      </Text>

      {loading ? (
        <Flex justify="center" py={12}>
          <Spinner color="brand.primary" size="lg" />
        </Flex>
      ) : evaluaciones.length === 0 ? (
        <Box
          p={10}
          borderWidth="1px"
          borderColor="blackAlpha.100"
          borderRadius="xl"
          bg="white"
          textAlign="center"
        >
          <Icon as={BookOpen} boxSize={10} color="blackAlpha.200" mb={4} />
          <Text fontWeight="semibold" color="brand.ink" mb={2}>
            Sin programas asignados
          </Text>
          <Text fontSize="sm" color="blackAlpha.600" maxW="36ch" mx="auto">
            Cuando tu administrador publique una inducción o capacitación, la verás disponible en esta lista.
          </Text>
        </Box>
      ) : (
        <VStack spacing={4} align="stretch">
          {evaluaciones.map((test) => {
            const avance = mapaAvances.get(Number(test.id_test))
            const estado = avance?.estado || 'pendiente'
            const esAprobada = estado === 'aprobada'
            const esEnCurso = estado === 'en_curso'
            const esReprobada = estado === 'reprobada'

            return (
              <Box
                key={test.id_test}
                p={5}
                borderWidth="1px"
                borderColor={esAprobada ? 'green.200' : 'blackAlpha.100'}
                borderRadius="xl"
                bg="white"
                boxShadow="2xs"
                transition="all 0.2s"
                _hover={{ borderColor: 'brand.primary' }}
              >
                <Flex
                  direction={{ base: 'column', sm: 'row' }}
                  justify="space-between"
                  align={{ base: 'flex-start', sm: 'center' }}
                  gap={4}
                >
                  <Box flex="1">
                    <HStack spacing={2.5} mb={1.5}>
                      <Badge
                        colorScheme={
                          esAprobada ? 'green' : esEnCurso ? 'blue' : esReprobada ? 'orange' : 'gray'
                        }
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                        fontSize="2xs"
                      >
                        {esAprobada
                          ? 'Aprobada'
                          : esEnCurso
                          ? 'En curso'
                          : esReprobada
                          ? 'Reprobada'
                          : 'Pendiente'}
                      </Badge>
                      <Text fontSize="xs" color="blackAlpha.500">
                        Exigencia: {test.porcentaje_aprobacion}% mínimo
                      </Text>
                    </HStack>

                    <Text fontWeight="bold" fontSize="md" color="brand.ink" lineHeight="1.3">
                      {test.titulo}
                    </Text>

                    <Text fontSize="xs" color="blackAlpha.600" mt={1}>
                      {test.total_preguntas || 4} preguntas · Modalidad online autogestionada
                    </Text>
                  </Box>

                  <HStack spacing={3}>
                    {esAprobada ? (
                      <Button
                        size="sm"
                        variant="solid"
                        colorScheme="green"
                        bg="green.600"
                        _hover={{ bg: 'green.700' }}
                        leftIcon={<Award size={15} />}
                        onClick={() =>
                          setCertificadoSeleccionado({
                            ...avance,
                            test_titulo: test.titulo,
                            nombre_usuario: user?.fullName || 'Colaborador',
                          })
                        }
                      >
                        Ver certificado
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="solid"
                        bg="brand.primary"
                        leftIcon={
                          esReprobada ? (
                            <RotateCcw size={14} />
                          ) : (
                            <Play size={13} fill="currentColor" />
                          )
                        }
                        isLoading={cargandoDetalleId === test.id_test}
                        onClick={() => handleAbrirEvaluacion(test)}
                      >
                        {esEnCurso ? 'Continuar prueba' : esReprobada ? 'Reintentar prueba' : 'Rendir prueba'}
                      </Button>
                    )}
                  </HStack>
                </Flex>
              </Box>
            )
          })}
        </VStack>
      )}

      {/* Modal para Rendir Evaluación */}
      <RendirEvaluacionModal
        isOpen={Boolean(testParaRendir)}
        onClose={() => setTestParaRendir(null)}
        test={testParaRendir}
        idEmpresa={organization?.id}
        user={user}
        onEvaluacionFinalizada={() => cargarDatos()}
        onAbrirCertificado={(reg) => setCertificadoSeleccionado(reg)}
      />

      {/* Modal Certificado */}
      <CertificadoModal
        isOpen={Boolean(certificadoSeleccionado)}
        onClose={() => setCertificadoSeleccionado(null)}
        avance={certificadoSeleccionado}
        empresa={{ nombre_comercial: organization?.name }}
        plan={null}
      />
    </Box>
  )
}
