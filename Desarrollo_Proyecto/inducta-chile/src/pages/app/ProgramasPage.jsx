import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { useOrganization, useUser } from '@clerk/clerk-react'
import {
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileSpreadsheet,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CertificadoModal from '../../components/dashboard/CertificadoModal'
import CrearEvaluacionModal from '../../components/dashboard/CrearEvaluacionModal'
import { useEmpresaCuenta } from '../../features/empresa/useEmpresaCuenta'
import {
  actualizarEstadoEvaluacion,
  crearEvaluacion,
  eliminarEvaluacion,
  EVALUACION_SEMILLA_DEFAULT,
  getAvancesEmpresa,
  getEvaluacionesEmpresa,
} from '../../features/programas/programasService'
import { useSupabase } from '../../hooks/useSupabase'
import {
  cuposEvaluacionesDisponibles,
  fechaCortaEs,
  getPlan,
  puedeCrearEvaluacion,
} from '../../lib/planes'

export default function ProgramasPage() {
  const { user } = useUser()
  const { organization, memberships } = useOrganization({ memberships: { infinite: true } })
  const supabase = useSupabase()
  const toast = useToast()
  const { empresa } = useEmpresaCuenta()

  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [tabIndex, setTabIndex] = useState(tabParam === 'avances' ? 1 : 0)

  const [evaluaciones, setEvaluaciones] = useState([])
  const [avances, setAvances] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false)
  const [certificadoSeleccionado, setCertificadoSeleccionado] = useState(null)
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  const plan = getPlan(empresa?.plan)
  const puedeCrear = puedeCrearEvaluacion(plan, evaluaciones.length)
  const cuposRestantes = cuposEvaluacionesDisponibles(plan, evaluaciones.length)

  // Cargar evaluaciones y avances
  const cargarDatos = useCallback(async () => {
    if (!organization?.id) return
    setLoading(true)
    try {
      const [tests, regAvances] = await Promise.all([
        getEvaluacionesEmpresa(supabase, organization.id),
        getAvancesEmpresa(supabase, organization.id),
      ])
      setEvaluaciones(tests)
      setAvances(regAvances)
    } catch (e) {
      console.warn('Error cargando programas:', e)
    } finally {
      setLoading(false)
    }
  }, [organization?.id, supabase])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const handleToggleEstado = async (test) => {
    const nuevoEstado = test.estado === 'activo' ? 'inactivo' : 'activo'
    await actualizarEstadoEvaluacion(supabase, test.id_test, organization.id, nuevoEstado)
    setEvaluaciones((prev) =>
      prev.map((t) => (t.id_test === test.id_test ? { ...t, estado: nuevoEstado } : t)),
    )
    toast({
      title: `Evaluación ${nuevoEstado === 'activo' ? 'activada' : 'desactivada'}`,
      status: 'info',
      duration: 2000,
    })
  }

  const handleEliminar = async (test) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${test.titulo}"?`)) return
    await eliminarEvaluacion(supabase, test.id_test, organization.id)
    setEvaluaciones((prev) => prev.filter((t) => t.id_test !== test.id_test))
    setAvances((prev) => prev.filter((a) => a.id_test !== test.id_test))
    toast({
      title: 'Evaluación eliminada',
      status: 'success',
      duration: 2500,
    })
  }

  const handleCargarInduccionEjemplo = async () => {
    if (!puedeCrear) {
      toast({
        title: 'Tope alcanzado',
        description: 'Su plan no permite más evaluaciones.',
        status: 'warning',
      })
      return
    }
    setLoading(true)
    try {
      const res = await crearEvaluacion(supabase, {
        id_empresa: organization.id,
        titulo: EVALUACION_SEMILLA_DEFAULT.titulo,
        porcentaje_aprobacion: EVALUACION_SEMILLA_DEFAULT.porcentaje_aprobacion,
        estado: 'activo',
        preguntas: EVALUACION_SEMILLA_DEFAULT.preguntas,
      })
      setEvaluaciones((prev) => [res.evaluacion, ...prev])
      toast({
        title: 'Inducción sugerida creada',
        description: 'Se ha configurado la inducción de Seguridad y Salud en el Trabajo.',
        status: 'success',
        duration: 3500,
      })
    } catch (err) {
      toast({ title: 'Error al crear inducción', description: err.message, status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Exportar avances a CSV (HU-15 para planes avanzados)
  const handleExportarCsv = () => {
    if (avances.length === 0) return
    const headers = ['Colaborador', 'Evaluacion', 'Estado', 'Puntaje', 'Fecha Evaluacion']
    const csvRows = [headers.join(';')]
    avances.forEach((a) => {
      csvRows.push(
        [
          `"${a.nombre_usuario || a.id_usuario}"`,
          `"${a.test_titulo || a.id_test}"`,
          `"${a.estado}"`,
          `"${a.puntaje || 0}%"`,
          `"${a.fecha_evaluacion || ''}"`,
        ].join(';'),
      )
    })
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `inducta_avances_${organization?.name || 'empresa'}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filtrado de avances (HU-14)
  const avancesFiltrados = useMemo(() => {
    return avances.filter((a) => {
      const matchTexto =
        !filtroTexto.trim() ||
        String(a.nombre_usuario || '').toLowerCase().includes(filtroTexto.toLowerCase()) ||
        String(a.test_titulo || '').toLowerCase().includes(filtroTexto.toLowerCase())
      const matchEstado = filtroEstado === 'todos' || a.estado === filtroEstado
      return matchTexto && matchEstado
    })
  }, [avances, filtroTexto, filtroEstado])

  return (
    <Box maxW="64rem" mx="auto">
      {/* Header */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        gap={4}
        mb={6}
      >
        <Box>
          <Flex align="center" gap={3}>
            <Icon as={ClipboardList} boxSize={6} color="brand.primary" strokeWidth={1.75} />
            <Heading as="h1" fontSize={{ base: '1.75rem', md: '2rem' }} color="brand.ink">
              Programas y Evaluaciones
            </Heading>
          </Flex>
          <Text color="blackAlpha.600" fontSize="sm" mt={1}>
            Cree cuestionarios por cargo, supervise las calificaciones y obtenga evidencias para auditorías.
          </Text>
        </Box>

        <HStack spacing={3}>
          {evaluaciones.length === 0 && (
            <Button
              size="sm"
              variant="outline"
              colorScheme="purple"
              leftIcon={<Sparkles size={15} />}
              onClick={handleCargarInduccionEjemplo}
              isLoading={loading}
            >
              Cargar inducción sugerida
            </Button>
          )}

          <Button
            size="sm"
            variant="solid"
            bg="brand.primary"
            leftIcon={<Plus size={16} />}
            isDisabled={!puedeCrear}
            onClick={() => setModalCrearAbierto(true)}
          >
            Nueva evaluación
          </Button>
        </HStack>
      </Flex>

      {/* Indicador de Cupos del Plan (HU-16) */}
      <Flex
        p={3.5}
        mb={6}
        bg="brand.soft"
        borderWidth="1px"
        borderColor="blackAlpha.100"
        borderRadius="xl"
        align="center"
        justify="space-between"
        fontSize="xs"
      >
        <Flex align="center" gap={2}>
          <Text color="blackAlpha.700">
            Plan <strong>{plan?.nombre || 'Demostración'}</strong>:
          </Text>
          <Badge colorScheme={cuposRestantes === 0 ? 'red' : 'blue'} borderRadius="full" px={2}>
            {plan?.maxEvaluaciones == null
              ? `${evaluaciones.length} creadas (Sin límite)`
              : `${evaluaciones.length} de ${plan.maxEvaluaciones} evaluaciones creadas`}
          </Badge>
        </Flex>

        {cuposRestantes === 0 && (
          <Text color="red.600" fontWeight="medium">
            Tope de evaluaciones alcanzado. Actualice su plan para crear más.
          </Text>
        )}
      </Flex>

      {/* Pestañas: Evaluaciones vs Seguimiento */}
      <Tabs
        index={tabIndex}
        onChange={(idx) => {
          setTabIndex(idx)
          setSearchParams(idx === 1 ? { tab: 'avances' } : {})
        }}
        colorScheme="blue"
      >
        <TabList borderColor="blackAlpha.100" mb={6}>
          <Tab fontWeight="semibold" fontSize="sm">
            Evaluaciones creadas ({evaluaciones.length})
          </Tab>
          <Tab fontWeight="semibold" fontSize="sm">
            Avances y Evidencia ({avances.length})
          </Tab>
        </TabList>

        <TabPanels>
          {/* Panel 1: Lista de Evaluaciones (HU-08, HU-11) */}
          <TabPanel p={0}>
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
                <Icon as={ClipboardList} boxSize={12} color="blackAlpha.200" mb={4} />
                <Heading fontSize="md" color="brand.ink" mb={2}>
                  No hay evaluaciones creadas aún
                </Heading>
                <Text fontSize="sm" color="blackAlpha.600" maxW="40ch" mx="auto" mb={6}>
                  Cree su primer cuestionario de inducción corporativa o cargue la plantilla base de seguridad laboral con un clic.
                </Text>
                <HStack justify="center" spacing={3}>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Sparkles size={15} />}
                    onClick={handleCargarInduccionEjemplo}
                  >
                    Cargar inducción sugerida
                  </Button>
                  <Button
                    size="sm"
                    variant="solid"
                    bg="brand.primary"
                    leftIcon={<Plus size={15} />}
                    onClick={() => setModalCrearAbierto(true)}
                  >
                    Crear evaluación desde cero
                  </Button>
                </HStack>
              </Box>
            ) : (
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                {evaluaciones.map((test) => (
                  <Box
                    key={test.id_test}
                    p={5}
                    borderWidth="1px"
                    borderColor="blackAlpha.100"
                    borderRadius="xl"
                    bg="white"
                    boxShadow="sm"
                    transition="all 0.2s"
                    _hover={{ borderColor: 'brand.primary' }}
                  >
                    <Flex justify="space-between" align="flex-start" mb={3}>
                      <Box flex="1" pr={2}>
                        <Text fontWeight="bold" fontSize="md" color="brand.ink" lineHeight="1.3">
                          {test.titulo}
                        </Text>
                        <HStack spacing={2} mt={1.5}>
                          <Badge
                            colorScheme={test.estado === 'activo' ? 'green' : 'gray'}
                            fontSize="2xs"
                            borderRadius="full"
                            px={2}
                          >
                            {test.estado === 'activo' ? 'Activa' : 'Inactiva'}
                          </Badge>
                          <Text fontSize="xs" color="blackAlpha.500">
                            Exigencia: {test.porcentaje_aprobacion}%
                          </Text>
                        </HStack>
                      </Box>
                      <IconButton
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        icon={<Trash2 size={15} />}
                        aria-label="Eliminar evaluación"
                        onClick={() => handleEliminar(test)}
                      />
                    </Flex>

                    <Flex
                      justify="space-between"
                      align="center"
                      pt={4}
                      mt={3}
                      borderTopWidth="1px"
                      borderColor="blackAlpha.50"
                      fontSize="xs"
                    >
                      <Text color="blackAlpha.600">
                        {test.total_preguntas || (test.preguntas ? test.preguntas.length : 0)} preguntas configuradas
                      </Text>
                      <HStack spacing={2}>
                        <Text fontSize="2xs" color="blackAlpha.500">
                          {test.estado === 'activo' ? 'Publicada' : 'Pausada'}
                        </Text>
                        <Switch
                          size="sm"
                          colorScheme="blue"
                          isChecked={test.estado === 'activo'}
                          onChange={() => handleToggleEstado(test)}
                        />
                      </HStack>
                    </Flex>
                  </Box>
                ))}
              </Grid>
            )}
          </TabPanel>

          {/* Panel 2: Avances y Evidencia (HU-14, HU-15, HU-18) */}
          <TabPanel p={0}>
            {/* Barra de filtros */}
            <Flex
              direction={{ base: 'column', md: 'row' }}
              gap={3}
              mb={6}
              justify="space-between"
              align={{ base: 'stretch', md: 'center' }}
            >
              <HStack spacing={3} flex="1">
                <InputGroup size="sm" maxW={{ base: 'full', md: '280px' }}>
                  <InputLeftElement pointerEvents="none">
                    <Search size={14} color="gray" />
                  </InputLeftElement>
                  <Input
                    placeholder="Buscar colaborador o prueba..."
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                  />
                </InputGroup>

                <Select
                  size="sm"
                  maxW="160px"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="en_curso">En curso</option>
                  <option value="reprobada">Reprobada</option>
                  <option value="pendiente">Pendiente</option>
                </Select>
              </HStack>

              {/* Botón de exportación para plan Plus/Plus+ (HU-15) */}
              <Button
                size="sm"
                variant="outline"
                leftIcon={<FileSpreadsheet size={15} />}
                isDisabled={avances.length === 0}
                onClick={handleExportarCsv}
              >
                Exportar CSV
              </Button>
            </Flex>

            {loading ? (
              <Flex justify="center" py={12}>
                <Spinner color="brand.primary" size="lg" />
              </Flex>
            ) : avancesFiltrados.length === 0 ? (
              <Box
                p={10}
                borderWidth="1px"
                borderColor="blackAlpha.100"
                borderRadius="xl"
                bg="white"
                textAlign="center"
              >
                <Icon as={Users} boxSize={12} color="blackAlpha.200" mb={4} />
                <Heading fontSize="md" color="brand.ink" mb={2}>
                  Sin registros de avances todavía
                </Heading>
                <Text fontSize="sm" color="blackAlpha.600" maxW="40ch" mx="auto">
                  Cuando sus colaboradores rindan las evaluaciones desde su panel, las notas, fechas y constancias se listarán aquí para fiscalizaciones.
                </Text>
              </Box>
            ) : (
              <VStack spacing={3} align="stretch">
                {avancesFiltrados.map((a) => {
                  const esAprobada = a.estado === 'aprobada'
                  const colorScheme = esAprobada
                    ? 'green'
                    : a.estado === 'en_curso'
                    ? 'blue'
                    : a.estado === 'reprobada'
                    ? 'red'
                    : 'gray'

                  return (
                    <Flex
                      key={a.id_avance || `${a.id_test}_${a.id_usuario}`}
                      p={4}
                      borderWidth="1px"
                      borderColor="blackAlpha.100"
                      borderRadius="xl"
                      bg="white"
                      align="center"
                      justify="space-between"
                      gap={4}
                      boxShadow="2xs"
                    >
                      <Box flex="1">
                        <Flex align="center" gap={2} mb={1}>
                          <Text fontWeight="semibold" fontSize="sm" color="brand.ink">
                            {a.nombre_usuario || a.id_usuario}
                          </Text>
                          <Badge colorScheme={colorScheme} fontSize="2xs" borderRadius="full" px={2}>
                            {a.estado === 'aprobada'
                              ? 'Aprobada'
                              : a.estado === 'en_curso'
                              ? 'En curso'
                              : a.estado === 'reprobada'
                              ? 'Reprobada'
                              : 'Pendiente'}
                          </Badge>
                        </Flex>
                        <Text fontSize="xs" color="blackAlpha.600">
                          {a.test_titulo || `Evaluación #${a.id_test}`} ·{' '}
                          {a.fecha_evaluacion ? fechaCortaEs(a.fecha_evaluacion) : 'Sin rendir'}
                        </Text>
                      </Box>

                      <HStack spacing={4}>
                        <Box textAlign="right">
                          <Text fontSize="xs" color="blackAlpha.500">
                            Nota obtenida
                          </Text>
                          <Text fontWeight="bold" fontSize="sm" color={esAprobada ? 'green.600' : 'brand.ink'}>
                            {a.puntaje != null ? `${a.puntaje}%` : '—'}
                          </Text>
                        </Box>

                        {/* Botón ver evidencia para el Administrador (HU-18) */}
                        {esAprobada && (
                          <Button
                            size="xs"
                            variant="outline"
                            colorScheme="blue"
                            leftIcon={<Eye size={13} />}
                            onClick={() => setCertificadoSeleccionado(a)}
                          >
                            Ver constancia
                          </Button>
                        )}
                      </HStack>
                    </Flex>
                  )
                })}
              </VStack>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modal Crear Evaluación */}
      <CrearEvaluacionModal
        isOpen={modalCrearAbierto}
        onClose={() => setModalCrearAbierto(false)}
        idEmpresa={organization?.id}
        plan={plan}
        totalActuales={evaluaciones.length}
        onEvaluacionCreada={(nueva) => {
          setEvaluaciones((prev) => [nueva, ...prev])
        }}
      />

      {/* Modal Certificado / Evidencia (HU-18) */}
      <CertificadoModal
        isOpen={Boolean(certificadoSeleccionado)}
        onClose={() => setCertificadoSeleccionado(null)}
        avance={certificadoSeleccionado}
        empresa={empresa}
        plan={plan}
      />
    </Box>
  )
}
