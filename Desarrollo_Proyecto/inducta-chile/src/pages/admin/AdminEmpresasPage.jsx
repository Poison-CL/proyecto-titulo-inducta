import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import BusquedaFiltroBanner from '../../components/dashboard/BusquedaFiltroBanner'
import { useSupabase } from '../../hooks/useSupabase'
import { filtraPorCampos } from '../../lib/panelBusqueda'
import { estadoPlan, fechaCortaEs, getPlan } from '../../lib/planes'

function colorVigencia(estado) {
  if (estado === 'vencido') return 'red.600'
  if (estado === 'por_vencer') return 'orange.700'
  return 'brand.primary'
}

export default function AdminEmpresasPage() {
  const supabase = useSupabase()
  const [params] = useSearchParams()
  const consulta = params.get('q')?.trim() || ''
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState(null)
  const [vence, setVence] = useState('')
  const [plan, setPlan] = useState('basico')
  const [saving, setSaving] = useState(false)

  const visibles = useMemo(
    () =>
      filtraPorCampos(rows, consulta, [
        'nombre_comercial',
        'email_contacto',
        'email_temporal',
        'plan',
        'cuenta_estado',
        'id_empresa',
      ]),
    [rows, consulta],
  )

  useEffect(() => {
    if (!consulta || loading) return
    requestAnimationFrame(() => {
      document.querySelector('[data-busqueda-hit]')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    })
  }, [consulta, loading, visibles])

  async function cargar() {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('empresa')
      .select(
        'id_empresa, nombre_comercial, email_contacto, plan, periodo, plan_vence_en, cuenta_estado, email_temporal',
      )
      .order('nombre_comercial')
    if (err) setError(err.message)
    setRows(data || [])
    setLoading(false)
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  function abrirEditar(e) {
    setEditId(e.id_empresa)
    setVence(e.plan_vence_en || '')
    setPlan(e.plan || 'basico')
  }

  async function guardarRenovacion(ev) {
    ev.preventDefault()
    if (!editId) return
    setSaving(true)
    setError('')
    const { error: err } = await supabase
      .from('empresa')
      .update({
        plan,
        plan_vence_en: vence || null,
        periodo: 'mensual',
      })
      .eq('id_empresa', editId)
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    setEditId(null)
    await cargar()
  }

  return (
    <Box maxW="56rem">
      <Heading
        as="h1"
        fontSize={{ base: '2rem', md: '2.4rem' }}
        fontWeight="semibold"
        letterSpacing="-0.03em"
        lineHeight="1.1"
        color="brand.ink"
        mb={3}
      >
        Empresas
      </Heading>
      <Text color="blackAlpha.700" fontSize={{ base: 'md', md: 'lg' }} lineHeight={1.6} maxW="44ch" mb={12}>
        Cuentas, estado y vencimiento de plan. Puede renovar o ajustar el plan aquí.
      </Text>

      {loading && (
        <Text fontSize="sm" color="blackAlpha.600">
          Cargando…
        </Text>
      )}
      {error && (
        <Text fontSize="sm" color="red.600" mb={4}>
          {error}
        </Text>
      )}

      <BusquedaFiltroBanner consulta={consulta} total={rows.length} visibles={visibles.length} />

      <VStack align="stretch" spacing={0} borderTopWidth="1px" borderColor="blackAlpha.100">
        {visibles.map((e) => {
          const vig = estadoPlan(e.plan_vence_en)
          const planNom = getPlan(e.plan)?.nombre || e.plan
          const colorVig = colorVigencia(vig.estado)
          return (
            <Box
              key={e.id_empresa}
              py={6}
              px={consulta ? 3 : 0}
              borderBottomWidth="1px"
              borderColor="blackAlpha.100"
              bg={consulta ? 'brand.wash' : undefined}
              borderRadius={consulta ? 'md' : undefined}
              data-busqueda-hit={consulta || undefined}
            >
              <Flex
                justify="space-between"
                gap={4}
                align={{ base: 'flex-start', md: 'center' }}
                direction={{ base: 'column', md: 'row' }}
              >
                <Box flex="1" minW={0}>
                  <Text fontWeight="semibold" color="brand.ink" fontSize="md">
                    {e.nombre_comercial}
                  </Text>
                  <Text fontSize="sm" color="blackAlpha.600" mt={1.5}>
                    {e.email_contacto || e.email_temporal || '—'} · {planNom}
                  </Text>
                  <Flex mt={2} gap={3} flexWrap="wrap" align="center">
                    <Text fontSize="xs" color="blackAlpha.500" fontWeight="medium">
                      {(e.cuenta_estado || '—').replace(/_/g, ' ')}
                    </Text>
                    <Text fontSize="sm" color={colorVig} fontWeight="medium">
                      Vence {fechaCortaEs(e.plan_vence_en)} · {vig.etiqueta}
                    </Text>
                  </Flex>
                </Box>
                <Button size="sm" variant="outline" onClick={() => abrirEditar(e)} flexShrink={0}>
                  Renovar / editar
                </Button>
              </Flex>

              {editId === e.id_empresa ? (
                <Box
                  as="form"
                  onSubmit={guardarRenovacion}
                  mt={5}
                  maxW="24rem"
                  p={5}
                  bg="brand.soft"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="blackAlpha.100"
                >
                  <VStack align="stretch" spacing={4}>
                    <FormControl>
                      <FormLabel fontSize="sm">Plan</FormLabel>
                      <Select value={plan} onChange={(ev) => setPlan(ev.target.value)} h="44px" bg="white">
                        <option value="demo">Demostración</option>
                        <option value="basico">Básico</option>
                        <option value="plus">Plus</option>
                        <option value="plusplus">Plus+</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Vence el</FormLabel>
                      <Input
                        type="date"
                        value={vence}
                        onChange={(ev) => setVence(ev.target.value)}
                        h="44px"
                        bg="white"
                      />
                    </FormControl>
                    <Flex gap={3}>
                      <Button type="submit" isLoading={saving} h="40px">
                        Guardar
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => setEditId(null)} h="40px">
                        Cancelar
                      </Button>
                    </Flex>
                  </VStack>
                </Box>
              ) : null}
            </Box>
          )
        })}
        {!loading && rows.length === 0 && (
          <Text py={12} fontSize="sm" color="blackAlpha.600">
            No hay empresas registradas.
          </Text>
        )}
        {!loading && rows.length > 0 && visibles.length === 0 && (
          <Text py={12} fontSize="sm" color="blackAlpha.600">
            Ninguna empresa coincide con la búsqueda.
          </Text>
        )}
      </VStack>
    </Box>
  )
}
