import { Box, Button, Flex, Grid, Spinner, Text } from '@chakra-ui/react'
import { useOrganization, useUser } from '@clerk/clerk-react'
import { Award, BookOpen, Play } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AccionCard from '../../components/dashboard/AccionCard'
import CertificadoModal from '../../components/dashboard/CertificadoModal'
import EstudioModulosModal from '../../components/dashboard/EstudioModulosModal'
import RendirEvaluacionModal from '../../components/dashboard/RendirEvaluacionModal'
import SettingsCard from '../../components/dashboard/SettingsCard'
import WorkspaceHome from '../../components/dashboard/WorkspaceHome'
import { useEmpresaCuenta } from '../../features/empresa/useEmpresaCuenta'
import {
  getAvancesEmpleado,
  getEvaluacionConPreguntas,
  getEvaluacionesEmpresa,
  idsItemsModulos,
  modulosCompletos,
  normalizarModulos,
  progresoModulosPct,
} from '../../features/programas/programasService'
import { useSupabase } from '../../hooks/useSupabase'
import { resolverBusquedaEmpleado } from '../../lib/panelBusqueda'
import { getPlan } from '../../lib/planes'

export default function EmpleadoDashboardPage() {
  const { user } = useUser()
  const { organization } = useOrganization()
  const supabase = useSupabase()
  const navigate = useNavigate()
  const { empresa } = useEmpresaCuenta()
  const plan = getPlan(empresa?.plan) || getPlan('demo')
  const nombre = user?.firstName || 'colaborador'

  const [evaluaciones, setEvaluaciones] = useState([])
  const [avances, setAvances] = useState([])
  const [loading, setLoading] = useState(true)
  const [testParaRendir, setTestParaRendir] = useState(null)
  const [estudioAbierto, setEstudioAbierto] = useState(null)
  const [cargandoTest, setCargandoTest] = useState(false)
  const [certificadoSeleccionado, setCertificadoSeleccionado] = useState(null)

  const cargarDatos = useCallback(async ({ silent = false } = {}) => {
    if (!organization?.id || !user?.id) return
    if (!silent) setLoading(true)
    try {
      const [tests, regs] = await Promise.all([
        getEvaluacionesEmpresa(supabase, organization.id),
        getAvancesEmpleado(supabase, organization.id, user.id),
      ])
      setEvaluaciones(tests.filter((t) => t.estado === 'activo'))
      setAvances(regs)
    } catch (e) {
      console.warn('Error cargando datos del empleado:', e)
      setEvaluaciones([])
      setAvances([])
    } finally {
      if (!silent) setLoading(false)
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

  const aprobadosCount = avances.filter((a) => a.estado === 'aprobada').length
  const totalAsignados = evaluaciones.length
  const idsAprobados = new Set(
    avances.filter((a) => a.estado === 'aprobada').map((a) => Number(a.id_test)),
  )
  const pendientes = evaluaciones.filter((t) => !idsAprobados.has(Number(t.id_test)))
  const proximoTest = pendientes[0] || null
  const pendientesCount = pendientes.length

  const avanceProximo = proximoTest
    ? avances.find((a) => Number(a.id_test) === Number(proximoTest.id_test))
    : null
  const hayModulosProximo = proximoTest ? idsItemsModulos(proximoTest.modulos).length > 0 : false
  const estudioListoProximo =
    !hayModulosProximo || modulosCompletos(proximoTest?.modulos, avanceProximo?.progreso_modulos)
  const pctEstudioProximo = hayModulosProximo
    ? progresoModulosPct(proximoTest.modulos, avanceProximo?.progreso_modulos)
    : 0
  const nNivelesProximo = proximoTest ? normalizarModulos(proximoTest.modulos).length : 0

  const handleIniciarRendir = async (test) => {
    setCargandoTest(true)
    try {
      const detalle = await getEvaluacionConPreguntas(supabase, test.id_test, organization?.id)
      const full = detalle || test
      const avance = avances.find((a) => Number(a.id_test) === Number(full.id_test))
      if (
        idsItemsModulos(full.modulos).length > 0 &&
        !modulosCompletos(full.modulos, avance?.progreso_modulos)
      ) {
        setEstudioAbierto(full)
        return
      }
      setTestParaRendir(full)
    } catch (e) {
      console.warn(e)
    } finally {
      setCargandoTest(false)
    }
  }

  const handleListoParaRendir = (test, progresoOverride = null) => {
    const avance = avances.find((a) => Number(a.id_test) === Number(test.id_test))
    const progreso = progresoOverride || avance?.progreso_modulos
    if (!modulosCompletos(test.modulos, progreso)) return
    setEstudioAbierto(null)
    setTestParaRendir(test)
  }

  return (
    <WorkspaceHome
      pillLabel={organization?.name || 'Inducta Chile'}
      pillTo="/empleado/perfil"
      titulo={`¿Qué necesita hoy, ${nombre}?`}
      placeholder="Buscar sección o programa…"
      onBuscar={onBuscar}
    >
      {loading ? (
        <Flex justify="center" py={10}>
          <Spinner color="brand.primary" />
        </Flex>
      ) : (
        <>
          {proximoTest ? (
            <Box mb={5}>
              <SettingsCard
                icon={hayModulosProximo && !estudioListoProximo ? BookOpen : Play}
                titulo="Siguiente inducción"
                bajada={`${pendientesCount} pendiente${pendientesCount === 1 ? '' : 's'} de ${totalAsignados}.`}
                footer={
                  <Button
                    size="sm"
                    h="36px"
                    leftIcon={
                      hayModulosProximo && !estudioListoProximo ? (
                        <BookOpen size={14} />
                      ) : (
                        <Play size={14} fill="currentColor" />
                      )
                    }
                    isLoading={cargandoTest}
                    onClick={() => handleIniciarRendir(proximoTest)}
                  >
                    {hayModulosProximo && !estudioListoProximo ? 'Estudiar' : 'Rendir ahora'}
                  </Button>
                }
              >
                <Text fontWeight="semibold" fontSize="sm" color="brand.ink">
                  {proximoTest.titulo}
                </Text>
                <Text fontSize="xs" color="blackAlpha.600" mt={1}>
                  {hayModulosProximo
                    ? `${nNivelesProximo} nivel${nNivelesProximo === 1 ? '' : 'es'} · estudio ${pctEstudioProximo}% · `
                    : ''}
                  Exigencia {proximoTest.porcentaje_aprobacion}% ·{' '}
                  {proximoTest.total_preguntas || 0} preguntas
                </Text>
              </SettingsCard>
            </Box>
          ) : null}

          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
            <AccionCard
              icon={BookOpen}
              meta={totalAsignados > 0 ? `${aprobadosCount}/${totalAsignados}` : '0'}
              titulo="Mis programas"
              bajada={
                pendientesCount > 0
                  ? `${pendientesCount} inducción${pendientesCount === 1 ? '' : 'es'} por completar · estudio, estado y notas.`
                  : totalAsignados > 0
                    ? 'Todas las inducciones asignadas están al día.'
                    : 'Cuando su empresa publique inducciones, aparecerán aquí.'
              }
              cta="Ir a programas"
              to="/empleado/programas"
              primary
            />
            <AccionCard
              icon={Award}
              meta={String(aprobadosCount)}
              titulo="Mis certificados"
              bajada={
                aprobadosCount > 0
                  ? 'Constancias listas para imprimir o guardar en PDF.'
                  : 'Las constancias se desbloquean al aprobar una inducción.'
              }
              cta="Ver certificados"
              to="/empleado/certificados"
            />
          </Grid>
        </>
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
        avance={
          estudioAbierto
            ? avances.find((a) => Number(a.id_test) === Number(estudioAbierto.id_test))
            : null
        }
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
          testParaRendir
            ? avances.find((a) => Number(a.id_test) === Number(testParaRendir.id_test))
            : null
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
    </WorkspaceHome>
  )
}
