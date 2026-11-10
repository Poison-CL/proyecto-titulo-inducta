import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useOrganization, useUser } from '@clerk/clerk-react'
import { Award, CheckCircle2, Clock, Eye, Play, TrendingUp, XCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import CertificadoModal from '../../components/dashboard/CertificadoModal'
import {
  getAvancesEmpleado,
  getEvaluacionesEmpresa,
} from '../../features/programas/programasService'
import { useSupabase } from '../../hooks/useSupabase'
import { fechaCortaEs } from '../../lib/planes'

export default function EmpleadoProgresosPage() {
  const { user } = useUser()
  const { organization } = useOrganization()
  const supabase = useSupabase()

  const [evaluaciones, setEvaluaciones] = useState([])
  const [avances, setAvances] = useState([])
  const [loading, setLoading] = useState(true)
  const [certificadoSeleccionado, setCertificadoSeleccionado] = useState(null)

  const cargarDatos = useCallback(async () => {
    if (!organization?.id || !user?.id) return
    setLoading(true)
    try {
      const [tests, regs] = await Promise.all([
        getEvaluacionesEmpresa(supabase, organization.id),
        getAvancesEmpleado(supabase, organization.id, user.id),
      ])
      setEvaluaciones(tests)
      setAvances(regs)
    } catch (e) {
      console.warn('Error cargando progreso:', e)
    } finally {
      setLoading(false)
    }
  }, [organization?.id, user?.id, supabase])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  // Combinar evaluaciones activas con avances del usuario
  const mapaAvances = new Map(avances.map((a) => [Number(a.id_test), a]))

  const listadoProgreso = evaluaciones.map((test) => {
    const avance = mapaAvances.get(Number(test.id_test))
    return {
      id_test: test.id_test,
      titulo: test.titulo,
      porcentaje_minimo: test.porcentaje_aprobacion,
      estado: avance?.estado || 'pendiente',
      puntaje: avance?.puntaje,
      fecha_evaluacion: avance?.fecha_evaluacion,
      avanceOriginal: avance,
    }
  })

  return (
    <Box maxW="52rem" mx="auto">
      {/* Header */}
      <Flex align="center" gap={3} mb={2}>
        <TrendingUp size={22} color="#1B22A7" strokeWidth={2} />
        <Heading
          as="h1"
          fontSize={{ base: 'xl', md: '2xl' }}
          fontWeight="semibold"
          letterSpacing="-0.02em"
          color="brand.ink"
        >
          Mi Progreso y Calificaciones
        </Heading>
      </Flex>
      <Text color="blackAlpha.600" mb={8} fontSize="sm">
        Seguimiento individual de cada evaluación de inducción completada o en curso (HU-13).
      </Text>

      {loading ? (
        <Flex justify="center" py={12}>
          <Spinner color="brand.primary" size="lg" />
        </Flex>
      ) : listadoProgreso.length === 0 ? (
        <Box
          p={10}
          borderWidth="1px"
          borderColor="blackAlpha.100"
          borderRadius="xl"
          bg="white"
          textAlign="center"
        >
          <Icon as={TrendingUp} boxSize={10} color="blackAlpha.200" mb={4} />
          <Text fontWeight="semibold" color="brand.ink" mb={2}>
            Sin registros de progreso
          </Text>
          <Text fontSize="sm" color="blackAlpha.600" maxW="36ch" mx="auto">
            El avance se actualizará automáticamente a medida que rindas las inducciones asignadas.
          </Text>
        </Box>
      ) : (
        <VStack spacing={3} align="stretch">
          {listadoProgreso.map((item) => {
            const esAprobada = item.estado === 'aprobada'
            const esEnCurso = item.estado === 'en_curso'
            const esReprobada = item.estado === 'reprobada'
            const badgeColor = esAprobada
              ? 'green'
              : esEnCurso
              ? 'blue'
              : esReprobada
              ? 'orange'
              : 'gray'

            return (
              <Flex
                key={item.id_test}
                p={4}
                borderWidth="1px"
                borderColor={esAprobada ? 'green.200' : 'blackAlpha.100'}
                borderRadius="xl"
                bg="white"
                align="center"
                justify="space-between"
                gap={4}
                boxShadow="2xs"
              >
                <Flex align="center" gap={3.5} flex="1">
                  <Flex
                    w="38px"
                    h="38px"
                    borderRadius="lg"
                    align="center"
                    justify="center"
                    bg={
                      esAprobada
                        ? 'green.50'
                        : esEnCurso
                        ? 'blue.50'
                        : esReprobada
                        ? 'orange.50'
                        : 'blackAlpha.50'
                    }
                  >
                    <Icon
                      as={
                        esAprobada
                          ? CheckCircle2
                          : esEnCurso
                          ? Clock
                          : esReprobada
                          ? XCircle
                          : Clock
                      }
                      color={
                        esAprobada
                          ? 'green.600'
                          : esEnCurso
                          ? 'blue.600'
                          : esReprobada
                          ? 'orange.600'
                          : 'blackAlpha.500'
                      }
                      boxSize={5}
                    />
                  </Flex>

                  <Box>
                    <Flex align="center" gap={2} mb={0.5}>
                      <Text fontWeight="semibold" fontSize="sm" color="brand.ink">
                        {item.titulo}
                      </Text>
                      <Badge colorScheme={badgeColor} borderRadius="full" px={2} py={0.5} fontSize="2xs">
                        {esAprobada
                          ? 'Aprobada'
                          : esEnCurso
                          ? 'En curso'
                          : esReprobada
                          ? 'Reprobada'
                          : 'Pendiente'}
                      </Badge>
                    </Flex>
                    <Text fontSize="xs" color="blackAlpha.500">
                      {item.fecha_evaluacion
                        ? `Rendida el ${fechaCortaEs(item.fecha_evaluacion)}`
                        : 'Aún no iniciada'}
                    </Text>
                  </Box>
                </Flex>

                <HStack spacing={4}>
                  <Box textAlign="right">
                    <Text fontSize="xs" color="blackAlpha.500">
                      Resultado
                    </Text>
                    <Text
                      fontWeight="bold"
                      fontSize="sm"
                      color={esAprobada ? 'green.600' : esReprobada ? 'orange.600' : 'brand.ink'}
                    >
                      {item.puntaje != null ? `${item.puntaje}%` : '—'}
                    </Text>
                  </Box>

                  {esAprobada && (
                    <Button
                      size="xs"
                      variant="outline"
                      colorScheme="blue"
                      leftIcon={<Eye size={13} />}
                      onClick={() =>
                        setCertificadoSeleccionado({
                          ...item.avanceOriginal,
                          test_titulo: item.titulo,
                          nombre_usuario: user?.fullName || 'Colaborador',
                        })
                      }
                    >
                      Constancia
                    </Button>
                  )}
                </HStack>
              </Flex>
            )
          })}
        </VStack>
      )}

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
