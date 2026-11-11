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
import { Award, Eye, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import CertificadoModal from '../../components/dashboard/CertificadoModal'
import {
  getAvancesEmpleado,
  getEvaluacionesEmpresa,
} from '../../features/programas/programasService'
import { useSupabase } from '../../hooks/useSupabase'
import { fechaCortaEs } from '../../lib/planes'

export default function EmpleadoCertificadosPage() {
  const { user } = useUser()
  const { organization } = useOrganization()
  const supabase = useSupabase()

  const [aprobados, setAprobados] = useState([])
  const [loading, setLoading] = useState(true)
  const [certificadoActivo, setCertificadoActivo] = useState(null)

  const cargarDatos = useCallback(async () => {
    if (!organization?.id || !user?.id) return
    setLoading(true)
    try {
      const [tests, regs] = await Promise.all([
        getEvaluacionesEmpresa(supabase, organization.id),
        getAvancesEmpleado(supabase, organization.id, user.id),
      ])

      const mapaTests = new Map(tests.map((t) => [Number(t.id_test), t]))
      const aprobadosFiltrados = regs
        .filter((r) => r.estado === 'aprobada')
        .map((r) => {
          const test = mapaTests.get(Number(r.id_test))
          return {
            ...r,
            test_titulo: test?.titulo || r.test_titulo || `Inducción #${r.id_test}`,
            porcentaje_minimo: test?.porcentaje_aprobacion || r.porcentaje_minimo || 70,
            nombre_usuario: user?.fullName || 'Colaborador',
          }
        })

      setAprobados(aprobadosFiltrados)
    } catch (e) {
      console.warn('Error cargando certificados:', e)
    } finally {
      setLoading(false)
    }
  }, [organization?.id, user?.id, supabase, user?.fullName])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  return (
    <Box maxW="48rem" mx="auto">
      {/* Header */}
      <Flex align="center" gap={3} mb={2}>
        <Award size={22} color="#1B22A7" strokeWidth={2} />
        <Heading
          as="h1"
          fontSize={{ base: 'xl', md: '2xl' }}
          fontWeight="semibold"
          letterSpacing="-0.02em"
          color="brand.ink"
        >
          Mis Certificados y Acreditaciones
        </Heading>
      </Flex>

      <Text color="blackAlpha.600" mb={8} fontSize="sm">
        Constancias oficiales de cumplimiento de inducción laboral emitidas para{' '}
        <strong>{user?.fullName || 'usted'}</strong> en <strong>{organization?.name || 'su empresa'}</strong> (HU-17).
      </Text>

      {loading ? (
        <Flex justify="center" py={12}>
          <Spinner color="brand.primary" size="lg" />
        </Flex>
      ) : aprobados.length === 0 ? (
        <Box
          p={10}
          borderWidth="1px"
          borderColor="blackAlpha.100"
          borderRadius="xl"
          bg="white"
          textAlign="center"
        >
          <Icon as={Award} boxSize={12} color="blackAlpha.200" mb={4} />
          <Heading fontSize="md" color="brand.ink" mb={2}>
            Sin certificados aún
          </Heading>
          <Text fontSize="sm" color="blackAlpha.600" maxW="32ch" mx="auto">
            Rinde y aprueba las inducciones asignadas en «Mis programas» para desbloquear tus certificados oficiales.
          </Text>
        </Box>
      ) : (
        <VStack spacing={4} align="stretch">
          {aprobados.map((cert) => (
            <Flex
              key={cert.id_avance || cert.id_test}
              p={5}
              borderWidth="1px"
              borderColor="green.200"
              borderRadius="xl"
              align="center"
              justify="space-between"
              gap={4}
              bg="white"
              boxShadow="2xs"
            >
              <Flex align="center" gap={4} flex="1">
                <Flex
                  w="44px"
                  h="44px"
                  borderRadius="xl"
                  bg="green.50"
                  borderWidth="1px"
                  borderColor="green.200"
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  <Icon as={ShieldCheck} boxSize={6} color="green.600" />
                </Flex>

                <Box>
                  <HStack spacing={2} mb={1}>
                    <Badge colorScheme="green" borderRadius="full" px={2} py={0.5} fontSize="2xs">
                      Aprobado ({cert.puntaje || 100}%)
                    </Badge>
                    <Text fontSize="xs" color="blackAlpha.500">
                      Exigencia: {cert.porcentaje_minimo}%
                    </Text>
                  </HStack>

                  <Text fontWeight="bold" color="brand.ink" fontSize="md">
                    {cert.test_titulo}
                  </Text>

                  <Text fontSize="xs" color="blackAlpha.600" mt={0.5}>
                    Acreditado el {cert.fecha_evaluacion ? fechaCortaEs(cert.fecha_evaluacion) : 'Recientemente'}
                  </Text>
                </Box>
              </Flex>

              <Button
                size="sm"
                variant="solid"
                bg="brand.primary"
                leftIcon={<Eye size={14} />}
                onClick={() => setCertificadoActivo(cert)}
              >
                Ver constancia
              </Button>
            </Flex>
          ))}
        </VStack>
      )}

      {/* Modal Certificado */}
      <CertificadoModal
        isOpen={Boolean(certificadoActivo)}
        onClose={() => setCertificadoActivo(null)}
        avance={certificadoActivo}
        empresa={{ nombre_comercial: organization?.name }}
        plan={null}
      />
    </Box>
  )
}
