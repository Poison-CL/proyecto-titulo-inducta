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
import { Award, BookOpen, CheckCircle2, ChevronRight, Play, TrendingUp } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AccionCard from '../../components/dashboard/AccionCard'
import CertificadoModal from '../../components/dashboard/CertificadoModal'
import RendirEvaluacionModal from '../../components/dashboard/RendirEvaluacionModal'
import WorkspaceHome from '../../components/dashboard/WorkspaceHome'
import {
  getAvancesEmpleado,
  getEvaluacionConPreguntas,
  getEvaluacionesEmpresa,
} from '../../features/programas/programasService'
import { useSupabase } from '../../hooks/useSupabase'
import { resolverBusquedaEmpleado } from '../../lib/panelBusqueda'

export default function EmpleadoDashboardPage() {
  const { user } = useUser()
  const { organization } = useOrganization()
  const supabase = useSupabase()
  const navigate = useNavigate()
  const nombre = user?.firstName || 'colaborador'

  const [evaluaciones, setEvaluaciones] = useState([])
  const [avances, setAvances] = useState([])
  const [loading, setLoading] = useState(true)
  const [testParaRendir, setTestParaRendir] = useState(null)
  const [cargandoTest, setCargandoTest] = useState(false)
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
      console.warn('Error cargando datos del empleado:', e)
    } finally {
      setLoading(false)
    }
  }, [organization?.id, user?.id, supabase])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const onBuscar = useCallback(
    async (q) => {
      const r = await resolverBusquedaEmpleado(q)
      if (r?.to) navigate(r.to)
      return r
    },
    [navigate],
  )

  // Métricas
  const aprobadosCount = avances.filter((a) => a.estado === 'aprobada').length
  const totalAsignados = evaluaciones.length

  // Determinar la "Inducción activa" prioritaria
  const idsAprobados = new Set(
    avances.filter((a) => a.estado === 'aprobada').map((a) => Number(a.id_test)),
  )
  const proximoTest = evaluaciones.find((t) => !idsAprobados.has(Number(t.id_test)))

  const handleIniciarRendir = async (test) => {
    setCargandoTest(true)
    try {
      const detalle = await getEvaluacionConPreguntas(supabase, test.id_test, organization?.id)
      setTestParaRendir(detalle || test)
    } catch (e) {
      console.warn(e)
    } finally {
      setCargandoTest(false)
    }
  }

  return (
    <WorkspaceHome
      pillLabel={organization?.name || 'Inducta Chile'}
      pillTo="/empleado"
      titulo={`Hola, ${nombre}.`}
      placeholder="Buscar sección o programa…"
      onBuscar={onBuscar}
    >
      {/* Tarjetas de Resumen Dinámicas */}
      <Box mb={8}>
        <Text
          fontSize="xs"
          fontWeight="semibold"
          letterSpacing="0.06em"
          color="blackAlpha.500"
          textTransform="uppercase"
          mb={4}
        >
          Tu actividad
        </Text>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={3}>
          <ResumenCard label="Programas asignados" valor={String(totalAsignados)} color="brand.primary" />
          <ResumenCard label="Etapas aprobadas" valor={String(aprobadosCount)} color="green.500" />
          <ResumenCard label="Certificados disponibles" valor={String(aprobadosCount)} color="purple.500" />
        </Grid>
      </Box>

      {/* Inducción Activa destacada */}
      <Box
        mb={8}
        p={6}
        borderWidth="1px"
        borderColor="blackAlpha.100"
        borderRadius="xl"
        bg="white"
        boxShadow="sm"
      >
        <Flex justify="space-between" align="center" mb={3}>
          <Text fontWeight="semibold" color="brand.ink" fontSize="sm">
            Inducción activa
          </Text>
          {proximoTest && (
            <Badge colorScheme="blue" borderRadius="full" px={2.5} py={0.5} fontSize="2xs">
              Pendiente
            </Badge>
          )}
        </Flex>

        {loading ? (
          <Flex align="center" gap={3} py={3}>
            <Spinner size="sm" color="brand.primary" />
            <Text fontSize="sm" color="blackAlpha.500">
              Cargando tus programas de inducción...
            </Text>
          </Flex>
        ) : proximoTest ? (
          <Flex
            direction={{ base: 'column', sm: 'row' }}
            justify="space-between"
            align={{ base: 'flex-start', sm: 'center' }}
            gap={4}
          >
            <Box>
              <Text fontWeight="bold" fontSize="md" color="brand.ink">
                {proximoTest.titulo}
              </Text>
              <Text color="blackAlpha.600" fontSize="sm" mt={0.5}>
                Exigencia de aprobación: {proximoTest.porcentaje_aprobacion}% · {proximoTest.total_preguntas || 4} preguntas
              </Text>
            </Box>
            <Button
              size="sm"
              variant="solid"
              bg="brand.primary"
              leftIcon={<Play size={14} fill="currentColor" />}
              isLoading={cargandoTest}
              onClick={() => handleIniciarRendir(proximoTest)}
            >
              Rendir evaluación
            </Button>
          </Flex>
        ) : totalAsignados > 0 && aprobadosCount === totalAsignados ? (
          <Flex align="center" justify="space-between" gap={4}>
            <HStack spacing={3}>
              <Icon as={CheckCircle2} color="green.500" boxSize={6} />
              <Box>
                <Text fontWeight="semibold" fontSize="sm" color="brand.ink">
                  ¡Felicitaciones! Has completado todas tus inducciones.
                </Text>
                <Text fontSize="xs" color="blackAlpha.600">
                  Tus acreditaciones y certificados están disponibles para descarga.
                </Text>
              </Box>
            </HStack>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Award size={15} />}
              onClick={() => navigate('/empleado/certificados')}
            >
              Ver certificados
            </Button>
          </Flex>
        ) : (
          <Text color="blackAlpha.600" fontSize="sm">
            Todavía no tienes un programa asignado. Cuando tu empresa publique inducciones o capacitaciones, aparecerán aquí.
          </Text>
        )}
      </Box>

      {/* Tarjetas de Navegación del Colaborador */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <AccionCard
          icon={BookOpen}
          titulo="Mis programas"
          bajada="Revisa las inducciones y capacitaciones que tu empresa te ha asignado."
          cta="Ver programas"
          to="/empleado/programas"
          primary
        />
        <AccionCard
          icon={TrendingUp}
          titulo="Mi progreso"
          bajada="Consulta el avance por etapa y calificaciones de cada programa."
          cta="Ver progreso"
          to="/empleado/progreso"
        />
        <AccionCard
          icon={Award}
          titulo="Mis certificados"
          bajada="Descarga las constancias de los programas que hayas aprobado."
          cta="Ver certificados"
          to="/empleado/certificados"
        />
      </Grid>

      {/* Modal Rendir Evaluación */}
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
    </WorkspaceHome>
  )
}

function ResumenCard({ label, valor, color }) {
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderColor="blackAlpha.100"
      borderRadius="lg"
      bg="white"
    >
      <VStack align="start" spacing={1}>
        <Text fontSize="xs" color="blackAlpha.500">
          {label}
        </Text>
        <Text fontSize="2xl" fontWeight="semibold" color={color}>
          {valor}
        </Text>
      </VStack>
    </Box>
  )
}
