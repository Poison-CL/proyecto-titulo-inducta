import { Box, Button, Flex, Spinner, Text, VStack } from '@chakra-ui/react'
import { useOrganization, useUser } from '@clerk/clerk-react'
import { Award } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import CertificadoModal from '../../components/dashboard/CertificadoModal'
import PanelPageHeader from '../../components/dashboard/PanelPageHeader'
import { useEmpresaCuenta } from '../../features/empresa/useEmpresaCuenta'
import {
  getAvancesEmpleado,
  getEvaluacionesEmpresa,
} from '../../features/programas/programasService'
import { useSupabase } from '../../hooks/useSupabase'
import { fechaCortaEs, getPlan } from '../../lib/planes'

export default function EmpleadoCertificadosPage() {
  const { user } = useUser()
  const { organization } = useOrganization()
  const supabase = useSupabase()
  const { empresa } = useEmpresaCuenta()
  const plan = getPlan(empresa?.plan) || getPlan('demo')

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
      setAprobados(
        regs
          .filter((r) => r.estado === 'aprobada')
          .map((r) => {
            const test = mapaTests.get(Number(r.id_test))
            return {
              ...r,
              test_titulo: test?.titulo || r.test_titulo || `Inducción #${r.id_test}`,
              porcentaje_minimo: test?.porcentaje_aprobacion || r.porcentaje_minimo || 70,
              nombre_usuario: user?.fullName || 'Colaborador',
            }
          }),
      )
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
    <Box maxW="64rem" mx="auto">
      <PanelPageHeader
        icon={Award}
        titulo="Mis certificados"
        bajada={`Constancias en ${organization?.name || 'su empresa'}.`}
      />

      {!loading && aprobados.length > 0 ? (
        <Text fontSize="sm" color="blackAlpha.600" mb={4}>
          {aprobados.length} constancia{aprobados.length === 1 ? '' : 's'} disponible
          {aprobados.length === 1 ? '' : 's'}
        </Text>
      ) : null}

      {loading ? (
        <Flex justify="center" py={12}>
          <Spinner color="brand.primary" size="lg" />
        </Flex>
      ) : aprobados.length === 0 ? (
        <Box borderWidth="1px" borderColor="blackAlpha.100" borderRadius="xl" bg="white" px={5} py={8}>
          <Text fontWeight="semibold" fontSize="sm" color="brand.ink" mb={1}>
            Sin certificados
          </Text>
          <Text fontSize="sm" color="blackAlpha.600">
            Apruebe una inducción en Mis programas para obtener su constancia.
          </Text>
        </Box>
      ) : (
        <Box borderWidth="1px" borderColor="blackAlpha.100" borderRadius="xl" bg="white" overflow="hidden">
          <Flex
            display={{ base: 'none', md: 'flex' }}
            px={5}
            py={2.5}
            borderBottomWidth="1px"
            borderColor="blackAlpha.100"
            bg="blackAlpha.50"
            gap={3}
            fontSize="2xs"
            fontWeight="semibold"
            letterSpacing="0.06em"
            textTransform="uppercase"
            color="blackAlpha.500"
          >
            <Text flex="1">Programa</Text>
            <Text w="3.5rem" textAlign="right">
              Nota
            </Text>
            <Text w="9rem">Fecha</Text>
            <Box w="7.5rem" />
          </Flex>

          <VStack align="stretch" spacing={0}>
            {aprobados.map((cert, i) => (
              <Flex
                key={cert.id_avance || cert.id_test}
                px={5}
                py={3.5}
                gap={3}
                align={{ base: 'flex-start', md: 'center' }}
                direction={{ base: 'column', md: 'row' }}
                borderTopWidth={i === 0 ? 0 : '1px'}
                borderColor="blackAlpha.100"
              >
                <Box flex="1" minW={0}>
                  <Text fontWeight="semibold" color="brand.ink" fontSize="sm" noOfLines={2}>
                    {cert.test_titulo}
                  </Text>
                  <Text fontSize="xs" color="blackAlpha.600" mt={0.5} display={{ md: 'none' }}>
                    {cert.puntaje != null ? `${cert.puntaje}%` : '—'} ·{' '}
                    {cert.fecha_evaluacion ? fechaCortaEs(cert.fecha_evaluacion) : 'Sin fecha'}
                  </Text>
                </Box>
                <Text
                  display={{ base: 'none', md: 'block' }}
                  fontSize="sm"
                  fontWeight="semibold"
                  color="brand.ink"
                  w="3.5rem"
                  textAlign="right"
                  flexShrink={0}
                >
                  {cert.puntaje != null ? `${cert.puntaje}%` : '—'}
                </Text>
                <Text
                  display={{ base: 'none', md: 'block' }}
                  fontSize="xs"
                  color="blackAlpha.600"
                  w="9rem"
                  flexShrink={0}
                >
                  {cert.fecha_evaluacion ? fechaCortaEs(cert.fecha_evaluacion) : '—'}
                </Text>
                <Button
                  size="sm"
                  h="36px"
                  minW={{ md: '7.5rem' }}
                  variant="outline"
                  onClick={() => setCertificadoActivo(cert)}
                >
                  Ver constancia
                </Button>
              </Flex>
            ))}
          </VStack>
        </Box>
      )}

      <CertificadoModal
        isOpen={Boolean(certificadoActivo)}
        onClose={() => setCertificadoActivo(null)}
        avance={certificadoActivo}
        empresa={{
          nombre_comercial: empresa?.nombre_comercial || organization?.name,
          plan: empresa?.plan,
        }}
        plan={plan}
        logoEmpresaUrl={organization?.imageUrl}
      />
    </Box>
  )
}
