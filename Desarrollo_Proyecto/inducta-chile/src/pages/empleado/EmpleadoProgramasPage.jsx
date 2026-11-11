import { Box, Button, Flex, Spinner, Text, VStack, useToast } from '@chakra-ui/react'
import { useOrganization, useUser } from '@clerk/clerk-react'
import { BookOpen, Play, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CertificadoModal from '../../components/dashboard/CertificadoModal'
import EstudioModulosModal from '../../components/dashboard/EstudioModulosModal'
import PanelPageHeader from '../../components/dashboard/PanelPageHeader'
import RendirEvaluacionModal from '../../components/dashboard/RendirEvaluacionModal'
import { useEmpresaCuenta } from '../../features/empresa/useEmpresaCuenta'
import {
  getAvancesEmpleado,
  getEvaluacionConPreguntas,
  getEvaluacionesEmpresa,
  idsItemsModulos,
  modulosCompletos,
  normalizarModulos,
  publicarAvancesLocalesPendientes,
} from '../../features/programas/programasService'
import { useSupabase } from '../../hooks/useSupabase'
import { getPlan } from '../../lib/planes'

function estadoMeta(estado) {
  if (estado === 'aprobada') return { label: 'Aprobada', color: 'green.600' }
  if (estado === 'en_curso') return { label: 'En curso', color: 'brand.primary' }
  if (estado === 'reprobada') return { label: 'Reprobada', color: 'orange.600' }
  return { label: 'Pendiente', color: 'blackAlpha.500' }
}

export default function EmpleadoProgramasPage() {
  const { user } = useUser()
  const { organization } = useOrganization()
  const supabase = useSupabase()
  const { empresa } = useEmpresaCuenta()
  const plan = getPlan(empresa?.plan) || getPlan('demo')
  const toast = useToast()
  const toastRef = useRef(toast)
  toastRef.current = toast

  const [evaluaciones, setEvaluaciones] = useState([])
  const [avances, setAvances] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [testParaRendir, setTestParaRendir] = useState(null)
  const [estudioAbierto, setEstudioAbierto] = useState(null)
  const [cargandoDetalleId, setCargandoDetalleId] = useState(null)
  const [certificadoSeleccionado, setCertificadoSeleccionado] = useState(null)

  const cargarDatos = useCallback(async ({ silent = false } = {}) => {
    if (!organization?.id || !user?.id) return
    if (!silent) setLoading(true)
    setErrorCarga('')
    try {
      let sync = { publicados: 0, fallidos: 0 }
      try {
        sync = await publicarAvancesLocalesPendientes(supabase, organization.id, user.id)
      } catch (syncErr) {
        console.warn('Sync avances:', syncErr?.message)
      }

      const [tests, regs] = await Promise.all([
        getEvaluacionesEmpresa(supabase, organization.id),
        getAvancesEmpleado(supabase, organization.id, user.id, { skipSync: true }),
      ])

      if (!silent && sync.publicados > 0) {
        toastRef.current({
          id: 'avances-sincronizados',
          title: 'Avances sincronizados',
          description: 'Su empresa ya puede ver sus resultados en el panel.',
          status: 'success',
          duration: 4000,
        })
      } else if (!silent && sync.fallidos > 0) {
        toastRef.current({
          id: 'avances-sync-error',
          title: 'No se pudieron publicar avances',
          description: sync.error || 'Reintente en unos segundos.',
          status: 'warning',
          duration: 6000,
        })
      }
      setEvaluaciones(tests.filter((t) => t.estado === 'activo'))
      setAvances(regs)
    } catch (e) {
      console.warn('Error cargando programas del empleado:', e)
      setErrorCarga(e.message || 'No se pudieron cargar los programas')
      setEvaluaciones([])
    } finally {
      if (!silent) setLoading(false)
    }
  }, [organization?.id, user?.id, supabase])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const mapaAvances = useMemo(
    () => new Map(avances.map((a) => [Number(a.id_test), a])),
    [avances],
  )

  const handleAbrirDetalle = async (test, { forzarEstudio = false } = {}) => {
    setCargandoDetalleId(test.id_test)
    try {
      const detalle = await getEvaluacionConPreguntas(supabase, test.id_test, organization?.id)
      const full = detalle || test
      const avance = mapaAvances.get(Number(full.id_test))
      const hayModulos = idsItemsModulos(full.modulos).length > 0
      const estudioListo = modulosCompletos(full.modulos, avance?.progreso_modulos)
      if (forzarEstudio || (hayModulos && !estudioListo)) {
        setEstudioAbierto(full)
      } else {
        setTestParaRendir(full)
      }
    } catch (e) {
      console.warn(e)
    } finally {
      setCargandoDetalleId(null)
    }
  }

  const handleListoParaRendir = (test, progresoOverride = null) => {
    const avance = mapaAvances.get(Number(test.id_test))
    const progreso = progresoOverride || avance?.progreso_modulos
    if (!modulosCompletos(test.modulos, progreso)) {
      toast({
        title: 'Estudio incompleto',
        description: 'Complete todos los contenidos antes de rendir.',
        status: 'warning',
        duration: 4000,
      })
      return
    }
    setEstudioAbierto(null)
    setTestParaRendir(test)
  }

  const pendientes = evaluaciones.filter((t) => mapaAvances.get(Number(t.id_test))?.estado !== 'aprobada').length

  return (
    <Box maxW="64rem" mx="auto">
      <PanelPageHeader
        icon={BookOpen}
        titulo="Mis programas"
        bajada={`Estudio, estado y notas de las inducciones de ${organization?.name || 'su empresa'}.`}
      />

      {!loading && evaluaciones.length > 0 ? (
        <Text fontSize="sm" color="blackAlpha.600" mb={4}>
          {evaluaciones.length} asignada{evaluaciones.length === 1 ? '' : 's'}
          {pendientes > 0 ? ` · ${pendientes} pendiente${pendientes === 1 ? '' : 's'}` : ' · al día'}
        </Text>
      ) : null}

      {errorCarga ? (
        <Box mb={4} px={4} py={3} borderRadius="md" bg="brand.wash" borderLeftWidth="3px" borderLeftColor="red.500">
          <Text fontSize="sm" color="brand.ink">
            {errorCarga}
          </Text>
        </Box>
      ) : null}

      {loading ? (
        <Flex justify="center" py={12}>
          <Spinner color="brand.primary" size="lg" />
        </Flex>
      ) : evaluaciones.length === 0 ? (
        <Box borderWidth="1px" borderColor="blackAlpha.100" borderRadius="xl" bg="white" px={5} py={8}>
          <Text fontWeight="semibold" fontSize="sm" color="brand.ink" mb={1}>
            Sin programas
          </Text>
          <Text fontSize="sm" color="blackAlpha.600">
            Cuando su administrador publique una inducción, aparecerá en esta lista.
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
            align="center"
            fontSize="2xs"
            fontWeight="semibold"
            letterSpacing="0.06em"
            textTransform="uppercase"
            color="blackAlpha.500"
          >
            <Text flex="1" minW={0}>
              Programa
            </Text>
            <Text w="6rem" flexShrink={0}>
              Estado
            </Text>
            <Text w="4rem" flexShrink={0} textAlign="right">
              Nota
            </Text>
            <Text w="17rem" flexShrink={0} textAlign="right">
              Acción
            </Text>
          </Flex>

          <VStack align="stretch" spacing={0}>
            {evaluaciones.map((test, i) => {
              const avance = mapaAvances.get(Number(test.id_test))
              const estado = avance?.estado || 'pendiente'
              const meta = estadoMeta(estado)
              const esAprobada = estado === 'aprobada'
              const esEnCurso = estado === 'en_curso'
              const esReprobada = estado === 'reprobada'
              const nNiveles = normalizarModulos(test.modulos).length
              const hayModulos = idsItemsModulos(test.modulos).length > 0
              const estudioListo = modulosCompletos(test.modulos, avance?.progreso_modulos)
              const ctaEstudio = hayModulos && !estudioListo

              return (
                <Flex
                  key={test.id_test}
                  px={5}
                  py={3.5}
                  gap={3}
                  align={{ base: 'flex-start', md: 'center' }}
                  direction={{ base: 'column', md: 'row' }}
                  borderTopWidth={i === 0 ? 0 : '1px'}
                  borderColor="blackAlpha.100"
                >
                  <Box flex="1" minW={0}>
                    <Text fontWeight="semibold" fontSize="sm" color="brand.ink" noOfLines={2}>
                      {test.titulo}
                    </Text>
                    <Text fontSize="xs" color="blackAlpha.600" mt={0.5}>
                      {nNiveles > 0 ? `${nNiveles} nivel${nNiveles === 1 ? '' : 'es'} · ` : ''}
                      {test.total_preguntas || 0} preguntas · exigencia {test.porcentaje_aprobacion}%
                    </Text>
                  </Box>

                  <Text
                    fontSize="xs"
                    fontWeight="semibold"
                    color={meta.color}
                    w={{ base: 'auto', md: '6rem' }}
                    flexShrink={0}
                  >
                    {meta.label}
                  </Text>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color="brand.ink"
                    w={{ base: 'auto', md: '4rem' }}
                    textAlign={{ md: 'right' }}
                    flexShrink={0}
                  >
                    {avance?.puntaje != null ? `${avance.puntaje}%` : '—'}
                  </Text>

                  <Flex
                    w={{ base: 'full', md: '17rem' }}
                    gap={2}
                    flexShrink={0}
                    justify={{ base: 'flex-start', md: 'flex-end' }}
                    flexWrap="nowrap"
                  >
                    {hayModulos ? (
                      <Button
                        size="sm"
                        h="36px"
                        minW="7.5rem"
                        variant={esAprobada ? 'outline' : ctaEstudio ? 'solid' : 'outline'}
                        leftIcon={<BookOpen size={14} />}
                        isLoading={cargandoDetalleId === test.id_test}
                        onClick={() => handleAbrirDetalle(test, { forzarEstudio: true })}
                      >
                        {ctaEstudio ? 'Estudiar' : 'Ver estudio'}
                      </Button>
                    ) : null}
                    {esAprobada ? (
                      <Button
                        size="sm"
                        h="36px"
                        minW="7.5rem"
                        variant="outline"
                        onClick={() =>
                          setCertificadoSeleccionado({
                            ...avance,
                            test_titulo: test.titulo,
                            nombre_usuario: user?.fullName || 'Colaborador',
                            porcentaje_minimo: test.porcentaje_aprobacion,
                          })
                        }
                      >
                        Constancia
                      </Button>
                    ) : !ctaEstudio ? (
                      <Button
                        size="sm"
                        h="36px"
                        minW="7.5rem"
                        leftIcon={esReprobada ? <RotateCcw size={14} /> : <Play size={13} fill="currentColor" />}
                        isLoading={cargandoDetalleId === test.id_test}
                        onClick={() => handleAbrirDetalle(test)}
                      >
                        {esEnCurso ? 'Continuar' : esReprobada ? 'Reintentar' : 'Rendir'}
                      </Button>
                    ) : null}
                  </Flex>
                </Flex>
              )
            })}
          </VStack>
        </Box>
      )}

      <EstudioModulosModal
        isOpen={Boolean(estudioAbierto)}
        onClose={() => {
          setEstudioAbierto(null)
          cargarDatos({ silent: true })
        }}
        test={estudioAbierto}
        idEmpresa={organization?.id}
        user={user}
        avance={estudioAbierto ? mapaAvances.get(Number(estudioAbierto.id_test)) : null}
        onProgreso={(reg) => {
          setAvances((prev) => {
            const rest = prev.filter(
              (a) => !(Number(a.id_test) === Number(reg.id_test) && a.id_usuario === reg.id_usuario),
            )
            return [reg, ...rest]
          })
        }}
        onListoParaRendir={handleListoParaRendir}
      />

      <RendirEvaluacionModal
        isOpen={Boolean(testParaRendir)}
        onClose={() => {
          setTestParaRendir(null)
          cargarDatos({ silent: true })
        }}
        test={testParaRendir}
        idEmpresa={organization?.id}
        user={user}
        avance={
          testParaRendir ? mapaAvances.get(Number(testParaRendir.id_test)) : null
        }
        onRequiereEstudio={(t) => {
          setTestParaRendir(null)
          setEstudioAbierto(t)
        }}
        onEvaluacionFinalizada={() => cargarDatos({ silent: true })}
        onAbrirCertificado={(reg) => setCertificadoSeleccionado(reg)}
      />

      <CertificadoModal
        isOpen={Boolean(certificadoSeleccionado)}
        onClose={() => setCertificadoSeleccionado(null)}
        avance={certificadoSeleccionado}
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
