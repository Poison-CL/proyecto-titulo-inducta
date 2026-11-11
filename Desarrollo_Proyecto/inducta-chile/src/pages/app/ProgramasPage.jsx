import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { useOrganization } from '@clerk/clerk-react'
import {
  ClipboardList,
  Eye,
  FileSpreadsheet,
  Plus,
  Search,
  Sparkles,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import CertificadoModal from '../../components/dashboard/CertificadoModal'
import CrearEvaluacionModal from '../../components/dashboard/CrearEvaluacionModal'
import EditarModulosModal from '../../components/dashboard/EditarModulosModal'
import PanelPageHeader from '../../components/dashboard/PanelPageHeader'
import SettingsCard from '../../components/dashboard/SettingsCard'
import { useEmpresaCuenta } from '../../features/empresa/useEmpresaCuenta'
import {
  actualizarEstadoEvaluacion,
  crearEvaluacion,
  eliminarEvaluacion,
  EVALUACION_SEMILLA_DEFAULT,
  getAvancesEmpresa,
  getEvaluacionesEmpresa,
  idsItemsModulos,
  normalizarEstadoAvance,
  normalizarModulos,
  publicarEvaluacionesLocalesPendientes,
} from '../../features/programas/programasService'
import { useSupabase } from '../../hooks/useSupabase'
import { esAdminEmpresa } from '../../lib/authRol'
import {
  cuposEvaluacionesDisponibles,
  fechaCortaEs,
  getPlan,
  puedeCrearEvaluacion,
} from '../../lib/planes'

function nombreDesdeMemberships(memberships, idUsuario) {
  const m = (memberships || []).find((x) => x.publicUserData?.userId === idUsuario)
  if (!m) return null
  const u = m.publicUserData
  const nombre = [u?.firstName, u?.lastName].filter(Boolean).join(' ')
  return nombre || u?.identifier || null
}

export default function ProgramasPage() {
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
  const [testModulos, setTestModulos] = useState(null)
  const [certificadoSeleccionado, setCertificadoSeleccionado] = useState(null)
  const [testAEliminar, setTestAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const cancelarEliminarRef = useRef(null)

  const plan = getPlan(empresa?.plan)
  const puedeCrear = puedeCrearEvaluacion(plan, evaluaciones.length)
  const cuposRestantes = cuposEvaluacionesDisponibles(plan, evaluaciones.length)

  const toastRef = useRef(toast)
  toastRef.current = toast

  const cargarDatos = useCallback(async () => {
    if (!organization?.id) return
    setLoading(true)
    try {
      try {
        const sync = await publicarEvaluacionesLocalesPendientes(supabase, organization.id)
        if (sync.publicados > 0) {
          toastRef.current({
            title: `${sync.publicados} evaluación(es) publicadas en la nube`,
            description: 'Ya quedaron visibles para los colaboradores.',
            status: 'success',
            duration: 4000,
          })
        }
      } catch (syncErr) {
        console.warn('Sync local→DB:', syncErr?.message)
      }

      const [tests, regAvances] = await Promise.all([
        getEvaluacionesEmpresa(supabase, organization.id),
        getAvancesEmpresa(supabase, organization.id),
      ])
      setEvaluaciones(tests)
      setAvances(regAvances || [])
    } catch (e) {
      console.warn('Error cargando programas:', e)
      toastRef.current({
        title: 'No se pudieron cargar programas desde Supabase',
        description: e.message,
        status: 'error',
        duration: 7000,
      })
    } finally {
      setLoading(false)
    }
  }, [organization?.id, supabase])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const handleToggleEstado = async (test) => {
    const nuevoEstado = test.estado === 'activo' ? 'inactivo' : 'activo'
    const previo = test.estado
    setEvaluaciones((prev) =>
      prev.map((t) => (t.id_test === test.id_test ? { ...t, estado: nuevoEstado } : t)),
    )
    try {
      await actualizarEstadoEvaluacion(supabase, test.id_test, organization.id, nuevoEstado)
      toast({
        title: nuevoEstado === 'activo' ? 'Evaluación publicada' : 'Evaluación pausada',
        status: 'success',
        duration: 2000,
      })
    } catch (e) {
      setEvaluaciones((prev) =>
        prev.map((t) => (t.id_test === test.id_test ? { ...t, estado: previo } : t)),
      )
      toast({
        title: 'No se pudo cambiar el estado',
        description: e.message,
        status: 'error',
        duration: 5000,
      })
    }
  }

  const confirmarEliminar = async () => {
    if (!testAEliminar || !organization?.id) return
    setEliminando(true)
    try {
      await eliminarEvaluacion(supabase, testAEliminar.id_test, organization.id)
      setEvaluaciones((prev) => prev.filter((t) => t.id_test !== testAEliminar.id_test))
      // Avances/certificados se conservan como evidencia histórica
      const tituloEliminado = testAEliminar.titulo
      setAvances((prev) =>
        prev.map((a) =>
          Number(a.id_test) === Number(testAEliminar.id_test)
            ? { ...a, test_titulo: a.test_titulo || tituloEliminado }
            : a,
        ),
      )
      setTestAEliminar(null)
      toast({
        title: 'Evaluación eliminada',
        description: 'Los avances y certificados del equipo se conservan.',
        status: 'success',
        duration: 3500,
      })
    } catch (e) {
      toast({
        title: 'No se pudo eliminar',
        description: e.message,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setEliminando(false)
    }
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

  const avancesEnriquecidos = useMemo(() => {
    const miembros = memberships?.data ?? []
    const mapaTitulos = new Map(evaluaciones.map((t) => [Number(t.id_test), t.titulo]))
    const mapaAvance = new Map()
    const huerfanos = []

    for (const a of avances || []) {
      if (a.id_test == null) {
        huerfanos.push(a)
        continue
      }
      mapaAvance.set(`${Number(a.id_test)}_${a.id_usuario}`, a)
    }

    const filas = []
    for (const m of miembros) {
      if (esAdminEmpresa(m)) continue
      const idUsuario = m.publicUserData?.userId
      if (!idUsuario) continue
      const nombre =
        [m.publicUserData?.firstName, m.publicUserData?.lastName].filter(Boolean).join(' ') ||
        m.publicUserData?.identifier ||
        idUsuario

      for (const test of evaluaciones) {
        const key = `${Number(test.id_test)}_${idUsuario}`
        const reg = mapaAvance.get(key)
        mapaAvance.delete(key)
        filas.push({
          ...(reg || {}),
          id_test: test.id_test,
          id_usuario: idUsuario,
          id_avance: reg?.id_avance,
          estado: normalizarEstadoAvance(reg?.estado) || 'pendiente',
          puntaje: reg?.puntaje ?? null,
          fecha_evaluacion: reg?.fecha_evaluacion || null,
          test_titulo: test.titulo,
          porcentaje_minimo: test.porcentaje_aprobacion || reg?.porcentaje_minimo || 70,
          nombre_usuario: reg?.nombre_usuario || nombre,
          sintetica: !reg,
        })
      }
    }

    const idsAdmin = new Set(
      miembros.filter((m) => esAdminEmpresa(m)).map((m) => m.publicUserData?.userId).filter(Boolean),
    )

    // Avances de gente que ya no está en el equipo, o tests borrados (sin admins)
    for (const reg of mapaAvance.values()) {
      if (idsAdmin.has(reg.id_usuario)) continue
      filas.push({
        ...reg,
        estado: normalizarEstadoAvance(reg.estado) || 'pendiente',
        test_titulo:
          reg.test_titulo || mapaTitulos.get(Number(reg.id_test)) || `Evaluación #${reg.id_test}`,
        nombre_usuario:
          reg.nombre_usuario || nombreDesdeMemberships(miembros, reg.id_usuario) || reg.id_usuario,
        sintetica: false,
      })
    }
    for (const reg of huerfanos) {
      if (idsAdmin.has(reg.id_usuario)) continue
      filas.push({
        ...reg,
        estado: normalizarEstadoAvance(reg.estado) || 'pendiente',
        test_titulo: reg.test_titulo || 'Inducción archivada',
        nombre_usuario:
          reg.nombre_usuario || nombreDesdeMemberships(miembros, reg.id_usuario) || reg.id_usuario,
        sintetica: false,
      })
    }

    return filas
  }, [avances, evaluaciones, memberships?.data])

  const avancesFiltrados = useMemo(() => {
    return avancesEnriquecidos.filter((a) => {
      const matchTexto =
        !filtroTexto.trim() ||
        String(a.nombre_usuario || '').toLowerCase().includes(filtroTexto.toLowerCase()) ||
        String(a.test_titulo || '').toLowerCase().includes(filtroTexto.toLowerCase())
      const matchEstado = filtroEstado === 'todos' || a.estado === filtroEstado
      return matchTexto && matchEstado
    })
  }, [avancesEnriquecidos, filtroTexto, filtroEstado])

  const escapeCsvCell = (val) => {
    let s = String(val ?? '')
    if (/^[=+\-@]/.test(s)) s = `'${s}`
    s = s.replace(/"/g, '""')
    return `"${s}"`
  }

  const handleExportarCsv = () => {
    if (avancesFiltrados.length === 0) return
    const labelEstado = (estado) =>
      estado === 'aprobada'
        ? 'Aprobada'
        : estado === 'en_curso'
          ? 'En progreso'
          : estado === 'reprobada'
            ? 'Reprobada'
            : 'No iniciado'
    const headers = ['Colaborador', 'Evaluacion', 'Estado', 'Puntaje', 'Fecha Evaluacion']
    const csvRows = [headers.map(escapeCsvCell).join(';')]
    avancesFiltrados.forEach((a) => {
      csvRows.push(
        [
          escapeCsvCell(a.nombre_usuario || a.id_usuario),
          escapeCsvCell(a.test_titulo || a.id_test),
          escapeCsvCell(labelEstado(a.estado)),
          escapeCsvCell(a.puntaje != null ? `${a.puntaje}%` : ''),
          escapeCsvCell(a.fecha_evaluacion || ''),
        ].join(';'),
      )
    })
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `inducta_avances_${organization?.name || 'empresa'}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const cuposTexto =
    plan?.maxEvaluaciones == null
      ? `${evaluaciones.length} evaluaciones · sin límite`
      : `${evaluaciones.length} de ${plan.maxEvaluaciones} evaluaciones del plan ${plan?.nombre || 'Demostración'}`

  const conteoAvancesPorTest = useMemo(() => {
    const map = new Map()
    for (const a of avancesEnriquecidos) {
      if (a.estado === 'pendiente') continue
      const k = Number(a.id_test)
      if (!Number.isFinite(k)) continue
      map.set(k, (map.get(k) || 0) + 1)
    }
    return map
  }, [avancesEnriquecidos])

  return (
    <Box maxW="64rem" mx="auto">
      <PanelPageHeader
        icon={ClipboardList}
        titulo="Programas y evaluaciones"
        bajada="Cree niveles de estudio, cuestionarios y revise evidencias del equipo."
        actions={
          <>
            {evaluaciones.length === 0 ? (
              <Button
                size="sm"
                h="36px"
                variant="outline"
                leftIcon={<Sparkles size={15} />}
                onClick={handleCargarInduccionEjemplo}
                isLoading={loading}
              >
                Inducción sugerida
              </Button>
            ) : null}
            <Button
              size="sm"
              h="36px"
              leftIcon={<Plus size={16} />}
              isDisabled={!puedeCrear}
              onClick={() => setModalCrearAbierto(true)}
            >
              Nueva evaluación
            </Button>
          </>
        }
      />

      <Text fontSize="sm" color="blackAlpha.600" mb={5}>
        {cuposTexto}
        {cuposRestantes === 0 ? (
          <>
            {' · '}
            <Button
              as={RouterLink}
              to="/dashboard/configuracion"
              variant="link"
              color="brand.primary"
              fontSize="sm"
              fontWeight="semibold"
              h="auto"
              p={0}
            >
              Actualizar plan
            </Button>
          </>
        ) : null}
      </Text>

      <Tabs
        index={tabIndex}
        onChange={(idx) => {
          setTabIndex(idx)
          setSearchParams(idx === 1 ? { tab: 'avances' } : {})
        }}
        variant="line"
      >
        <TabList borderColor="blackAlpha.100" mb={5}>
          <Tab
            fontWeight="semibold"
            fontSize="sm"
            color="blackAlpha.500"
            _selected={{ color: 'brand.ink', borderColor: 'brand.ink' }}
          >
            Evaluaciones ({evaluaciones.length})
          </Tab>
          <Tab
            fontWeight="semibold"
            fontSize="sm"
            color="blackAlpha.500"
            _selected={{ color: 'brand.ink', borderColor: 'brand.ink' }}
          >
            Avances ({avancesEnriquecidos.length})
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            {loading ? (
              <Flex justify="center" py={12}>
                <Spinner color="brand.primary" size="lg" />
              </Flex>
            ) : evaluaciones.length === 0 ? (
              <SettingsCard
                icon={ClipboardList}
                titulo="Sin evaluaciones"
                bajada="Cree la primera inducción o use la plantilla sugerida."
                footer={
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      h="36px"
                      variant="outline"
                      leftIcon={<Sparkles size={15} />}
                      onClick={handleCargarInduccionEjemplo}
                    >
                      Inducción sugerida
                    </Button>
                    <Button
                      size="sm"
                      h="36px"
                      leftIcon={<Plus size={15} />}
                      onClick={() => setModalCrearAbierto(true)}
                    >
                      Crear desde cero
                    </Button>
                  </HStack>
                }
              />
            ) : (
              <SettingsCard
                icon={ClipboardList}
                titulo="Evaluaciones"
                bajada={`${evaluaciones.length} en esta empresa.`}
              >
                <VStack align="stretch" spacing={0} mt={1}>
                  {evaluaciones.map((test, i) => {
                    const nPreguntas =
                      test.total_preguntas || (test.preguntas ? test.preguntas.length : 0)
                    const nAvances = conteoAvancesPorTest.get(Number(test.id_test)) || 0
                    const nNiveles = normalizarModulos(test.modulos).length
                    const nContenidos = idsItemsModulos(test.modulos).length
                    const publicada = test.estado === 'activo'
                    return (
                      <Flex
                        key={test.id_test}
                        py={3.5}
                        gap={3}
                        align={{ base: 'flex-start', md: 'center' }}
                        direction={{ base: 'column', md: 'row' }}
                        borderTopWidth={i === 0 ? 0 : '1px'}
                        borderColor="blackAlpha.100"
                      >
                        <Flex align="flex-start" gap={3} flex="1" minW={0}>
                          <Box
                            w="8px"
                            h="8px"
                            mt="6px"
                            borderRadius="full"
                            bg={publicada ? 'green.500' : 'blackAlpha.300'}
                            flexShrink={0}
                          />
                          <Box minW={0}>
                            <Text
                              fontWeight="semibold"
                              color="brand.ink"
                              fontSize="sm"
                              letterSpacing="-0.01em"
                              noOfLines={2}
                            >
                              {test.titulo}
                            </Text>
                            <Text fontSize="xs" color="blackAlpha.600" mt={0.5}>
                              {nNiveles > 0
                                ? `${nNiveles} nivel${nNiveles === 1 ? '' : 'es'} · ${nContenidos} contenidos · `
                                : 'Sin niveles de estudio · '}
                              {nPreguntas} preguntas · exigencia {test.porcentaje_aprobacion}% ·{' '}
                              {nAvances} {nAvances === 1 ? 'avance' : 'avances'}
                            </Text>
                          </Box>
                        </Flex>

                        <Flex gap={2} w={{ base: 'full', md: 'auto' }} align="center" flexShrink={0} flexWrap="wrap">
                          <Button
                            size="sm"
                            h="36px"
                            variant="outline"
                            onClick={() => setTestModulos(test)}
                          >
                            {nNiveles > 0 ? 'Editar niveles' : 'Agregar niveles'}
                          </Button>
                          <Button
                            size="sm"
                            h="36px"
                            minW="6.5rem"
                            variant={publicada ? 'solid' : 'outline'}
                            onClick={() => handleToggleEstado(test)}
                            aria-pressed={publicada}
                          >
                            {publicada ? 'Publicada' : 'Pausada'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            color="red.600"
                            h="36px"
                            minW="4.25rem"
                            onClick={() => setTestAEliminar(test)}
                          >
                            Eliminar
                          </Button>
                        </Flex>
                      </Flex>
                    )
                  })}
                </VStack>
              </SettingsCard>
            )}
          </TabPanel>

          <TabPanel p={0}>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              gap={3}
              mb={4}
              justify="space-between"
              align={{ base: 'stretch', md: 'center' }}
            >
              <HStack spacing={3} flex="1">
                <InputGroup size="sm" maxW={{ base: 'full', md: '280px' }}>
                  <InputLeftElement pointerEvents="none" h="36px">
                    <Search size={14} color="gray" />
                  </InputLeftElement>
                  <Input
                    placeholder="Buscar colaborador o prueba…"
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    h="36px"
                    borderRadius="md"
                    bg="white"
                  />
                </InputGroup>

                <Select
                  size="sm"
                  maxW="160px"
                  h="36px"
                  borderRadius="md"
                  bg="white"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">No iniciado</option>
                  <option value="en_curso">En progreso</option>
                  <option value="aprobada">Aprobada</option>
                  <option value="reprobada">Reprobada</option>
                </Select>
              </HStack>

              <Button
                size="sm"
                h="36px"
                variant="outline"
                leftIcon={<FileSpreadsheet size={15} />}
                isDisabled={avancesFiltrados.length === 0}
                onClick={handleExportarCsv}
              >
                Exportar CSV
              </Button>
            </Flex>

            {loading ? (
              <Flex justify="center" py={12}>
                <Spinner color="brand.primary" size="lg" />
              </Flex>
            ) : evaluaciones.length === 0 ? (
              <SettingsCard
                icon={Users}
                titulo="Sin evaluaciones"
                bajada="Cree o publique una evaluación para ver el avance de cada colaborador."
              />
            ) : avancesFiltrados.length === 0 ? (
              <SettingsCard
                icon={Users}
                titulo="Sin resultados con ese filtro"
                bajada="Pruebe otro estado o limpie la búsqueda. Se listan todos los colaboradores × evaluaciones."
                footer={
                  <Button size="sm" h="36px" variant="outline" isLoading={loading} onClick={cargarDatos}>
                    Actualizar avances
                  </Button>
                }
              />
            ) : (
              <SettingsCard
                icon={Users}
                titulo="Avances y evidencia"
                bajada={`${avancesFiltrados.length} registro${avancesFiltrados.length === 1 ? '' : 's'} · colaborador × evaluación${filtroTexto || filtroEstado !== 'todos' ? ' · filtrado' : ''}.`}
              >
                <VStack align="stretch" spacing={0} mt={1}>
                  {avancesFiltrados.map((a, i) => {
                    const esAprobada = a.estado === 'aprobada'
                    const estudiando =
                      a.estado === 'pendiente' &&
                      Array.isArray(a.progreso_modulos?.completados) &&
                      a.progreso_modulos.completados.length > 0
                    const estadoLabel =
                      a.estado === 'aprobada'
                        ? 'Aprobada'
                        : a.estado === 'en_curso'
                          ? 'En progreso'
                          : a.estado === 'reprobada'
                            ? 'Reprobada'
                            : estudiando
                              ? 'Estudiando'
                              : 'No iniciado'
                    const estadoColor = esAprobada
                      ? 'green.600'
                      : a.estado === 'en_curso' || estudiando
                        ? 'brand.primary'
                        : a.estado === 'reprobada'
                          ? 'orange.600'
                          : 'blackAlpha.500'

                    return (
                      <Flex
                        key={a.id_avance || `${a.id_test}_${a.id_usuario}`}
                        py={3.5}
                        gap={3}
                        align={{ base: 'flex-start', md: 'center' }}
                        direction={{ base: 'column', md: 'row' }}
                        borderTopWidth={i === 0 ? 0 : '1px'}
                        borderColor="blackAlpha.100"
                      >
                        <Box flex="1" minW={0}>
                          <Text fontWeight="semibold" color="brand.ink" fontSize="sm" noOfLines={1}>
                            {a.nombre_usuario || a.id_usuario}
                          </Text>
                          <Text fontSize="xs" color="blackAlpha.600" mt={0.5} noOfLines={1}>
                            {a.test_titulo || `Evaluación #${a.id_test}`} ·{' '}
                            {a.fecha_evaluacion
                              ? fechaCortaEs(a.fecha_evaluacion)
                              : a.estado === 'pendiente'
                                ? 'Aún no inicia'
                                : 'Sin fecha'}
                          </Text>
                        </Box>

                        <Flex gap={3} align="center" flexShrink={0} w={{ base: 'full', md: 'auto' }}>
                          <Text fontSize="xs" fontWeight="semibold" color={estadoColor} minW="4.5rem">
                            {estadoLabel}
                          </Text>
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={esAprobada ? 'green.600' : 'brand.ink'}
                            minW="3rem"
                            textAlign="right"
                          >
                            {a.puntaje != null ? `${a.puntaje}%` : '—'}
                          </Text>
                          {esAprobada ? (
                            <Button
                              size="sm"
                              h="36px"
                              variant="outline"
                              leftIcon={<Eye size={14} />}
                              onClick={() => setCertificadoSeleccionado(a)}
                            >
                              Constancia
                            </Button>
                          ) : (
                            <Box w={{ md: '7.5rem' }} display={{ base: 'none', md: 'block' }} />
                          )}
                        </Flex>
                      </Flex>
                    )
                  })}
                </VStack>
              </SettingsCard>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

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

      <EditarModulosModal
        isOpen={Boolean(testModulos)}
        onClose={() => setTestModulos(null)}
        test={testModulos}
        idEmpresa={organization?.id}
        onGuardado={(actualizada) => {
          setEvaluaciones((prev) =>
            prev.map((t) => (Number(t.id_test) === Number(actualizada.id_test) ? { ...t, ...actualizada } : t)),
          )
          setTestModulos(null)
        }}
      />

      <CertificadoModal
        isOpen={Boolean(certificadoSeleccionado)}
        onClose={() => setCertificadoSeleccionado(null)}
        avance={certificadoSeleccionado}
        empresa={empresa}
        plan={plan}
        logoEmpresaUrl={organization?.imageUrl}
      />

      <AlertDialog
        isOpen={Boolean(testAEliminar)}
        leastDestructiveRef={cancelarEliminarRef}
        onClose={() => {
          if (!eliminando) setTestAEliminar(null)
        }}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.700" backdropFilter="blur(2px)">
          <AlertDialogContent borderRadius="xl" mx={4}>
            <AlertDialogHeader
              fontSize="md"
              fontWeight="semibold"
              letterSpacing="-0.02em"
              color="brand.ink"
              pb={2}
            >
              Eliminar evaluación
            </AlertDialogHeader>
            <AlertDialogBody fontSize="sm" color="blackAlpha.700" lineHeight="1.55">
              ¿Seguro que desea eliminar{' '}
              <Text as="span" fontWeight="semibold" color="brand.ink">
                {testAEliminar?.titulo}
              </Text>
              ? Dejará de estar disponible para rendir. Los avances y certificados del equipo se
              conservan.
            </AlertDialogBody>
            <AlertDialogFooter gap={2}>
              <Button
                ref={cancelarEliminarRef}
                size="sm"
                h="36px"
                variant="outline"
                isDisabled={eliminando}
                onClick={() => setTestAEliminar(null)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                h="36px"
                bg="red.600"
                color="white"
                _hover={{ bg: 'red.700' }}
                isLoading={eliminando}
                loadingText="Eliminando…"
                onClick={confirmarEliminar}
              >
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}
