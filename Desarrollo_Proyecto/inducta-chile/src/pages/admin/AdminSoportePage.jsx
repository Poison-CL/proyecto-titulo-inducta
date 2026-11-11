import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { MessageSquare } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PanelPageHeader from '../../components/dashboard/PanelPageHeader'
import { useSupabase } from '../../hooks/useSupabase'

const FILTROS = [
  { id: 'abiertos', label: 'Abiertos' },
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'en_curso', label: 'En curso' },
  { id: 'atendido', label: 'Cerrados' },
  { id: 'todos', label: 'Todos' },
]

const ETIQUETA = {
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  atendido: 'Cerrado',
}

const COLOR = {
  pendiente: 'orange.600',
  en_curso: 'blue.600',
  atendido: 'green.700',
}

function horaCorta(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-CL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function nombreAgente(valor, fallback = 'Agente Inducta') {
  if (!valor) return null
  if (/^user_[A-Za-z0-9]+$/.test(valor)) return fallback
  return valor
}

function nombreUsuarioActual(user) {
  if (!user) return 'Agente Inducta'
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return (
    full ||
    user.fullName ||
    user.username ||
    user.primaryEmailAddress?.emailAddress ||
    'Agente Inducta'
  )
}

export default function AdminSoportePage() {
  const supabase = useSupabase()
  const { getToken } = useAuth()
  const { user } = useUser()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  const [tickets, setTickets] = useState([])
  const [mensajes, setMensajes] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingChat, setLoadingChat] = useState(false)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('abiertos')
  const [busqueda, setBusqueda] = useState('')
  const [seleccionadoId, setSeleccionadoId] = useState(() => Number(params.get('id')) || null)
  const [draft, setDraft] = useState('')
  const [notaDraft, setNotaDraft] = useState('')
  const [mostrarOpciones, setMostrarOpciones] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)
  const [guardandoNota, setGuardandoNota] = useState(false)

  const yo = useMemo(() => nombreUsuarioActual(user), [user])

  const cargarTickets = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase
      .from('contactos')
      .select(
        'id, creado_en, motivo, nombre, empresa, email, mensaje, estado, respondido_en, respondido_por, atendido_en, nota_interna',
      )
      .order('creado_en', { ascending: false })
      .limit(120)
    if (err) setError(err.message)
    setTickets(data || [])
    setLoading(false)
  }, [supabase])

  const cargarMensajes = useCallback(
    async (contactoId) => {
      if (!contactoId) {
        setMensajes([])
        return
      }
      setLoadingChat(true)
      const { data, error: err } = await supabase
        .from('soporte_mensajes')
        .select('id, contacto_id, autor, cuerpo, email_enviado, email_error, creado_por, creado_en')
        .eq('contacto_id', contactoId)
        .order('creado_en', { ascending: true })

      if (err) {
        const ticket = tickets.find((t) => t.id === contactoId)
        setMensajes(
          ticket
            ? [
                {
                  id: `local-${ticket.id}`,
                  autor: 'cliente',
                  cuerpo: ticket.mensaje,
                  creado_en: ticket.creado_en,
                  email_enviado: false,
                },
              ]
            : [],
        )
        if (!/relation|does not exist|soporte_mensajes/i.test(err.message)) {
          toast({ title: 'Chat', description: err.message, status: 'warning', duration: 5000 })
        }
      } else if (!data?.length) {
        const ticket = tickets.find((t) => t.id === contactoId)
        setMensajes(
          ticket
            ? [
                {
                  id: `local-${ticket.id}`,
                  autor: 'cliente',
                  cuerpo: ticket.mensaje,
                  creado_en: ticket.creado_en,
                  email_enviado: false,
                },
              ]
            : [],
        )
      } else {
        setMensajes(data)
      }
      setLoadingChat(false)
    },
    [supabase, tickets, toast],
  )

  useEffect(() => {
    cargarTickets()
  }, [cargarTickets])

  const conteos = useMemo(() => {
    const c = { pendiente: 0, en_curso: 0, atendido: 0, abiertos: 0, todos: tickets.length }
    for (const t of tickets) {
      const e = t.estado || 'pendiente'
      c[e] = (c[e] || 0) + 1
      if (e !== 'atendido') c.abiertos += 1
    }
    return c
  }, [tickets])

  const visibles = useMemo(() => {
    let list = tickets
    if (filtro === 'abiertos') list = list.filter((t) => (t.estado || 'pendiente') !== 'atendido')
    else if (filtro !== 'todos') list = list.filter((t) => (t.estado || 'pendiente') === filtro)
    const q = busqueda.trim().toLowerCase()
    if (!q) return list
    return list.filter((t) =>
      [t.nombre, t.email, t.empresa, t.mensaje, t.motivo, t.respondido_por]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    )
  }, [tickets, filtro, busqueda])

  const seleccionado = useMemo(
    () => tickets.find((t) => t.id === seleccionadoId) || null,
    [tickets, seleccionadoId],
  )

  useEffect(() => {
    if (!seleccionadoId && visibles[0]) setSeleccionadoId(visibles[0].id)
  }, [visibles, seleccionadoId])

  useEffect(() => {
    if (!seleccionadoId) return
    const next = new URLSearchParams(params)
    next.set('id', String(seleccionadoId))
    setParams(next, { replace: true })
    cargarMensajes(seleccionadoId)
    setDraft('')
    setMostrarOpciones(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seleccionadoId])

  useEffect(() => {
    setNotaDraft(seleccionado?.nota_interna || '')
  }, [seleccionado?.id, seleccionado?.nota_interna])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [mensajes, loadingChat])

  async function actualizarTicket(patch, okTitle) {
    if (!seleccionado) return false
    setCambiandoEstado(true)
    const { error: err } = await supabase.from('contactos').update(patch).eq('id', seleccionado.id)
    setCambiandoEstado(false)
    if (err) {
      toast({ title: 'No se pudo actualizar', description: err.message, status: 'error' })
      return false
    }
    if (okTitle) toast({ title: okTitle, status: 'success', duration: 2500 })
    await cargarTickets()
    return true
  }

  async function tomarTicket() {
    await actualizarTicket(
      {
        estado: 'en_curso',
        respondido_por: yo,
        respondido_en: new Date().toISOString(),
        atendido_en: null,
      },
      `Ticket tomado por ${yo}`,
    )
  }

  async function cambiarEstado(estado) {
    const patch = {
      estado,
      atendido_en: estado === 'atendido' ? new Date().toISOString() : null,
    }
    if (estado === 'en_curso' && !seleccionado?.respondido_por) {
      patch.respondido_por = yo
      patch.respondido_en = new Date().toISOString()
    }
    await actualizarTicket(
      patch,
      estado === 'atendido' ? 'Conversación cerrada' : `Estado: ${ETIQUETA[estado]}`,
    )
  }

  async function soltarTicket() {
    await actualizarTicket(
      {
        estado: 'pendiente',
        respondido_por: null,
        respondido_en: null,
        atendido_en: null,
      },
      'Ticket liberado',
    )
  }

  async function guardarNota() {
    if (!seleccionado) return
    setGuardandoNota(true)
    const { error: err } = await supabase
      .from('contactos')
      .update({ nota_interna: notaDraft.trim() || null })
      .eq('id', seleccionado.id)
    setGuardandoNota(false)
    if (err) {
      toast({ title: 'No se guardó la nota', description: err.message, status: 'error' })
      return
    }
    toast({ title: 'Nota interna guardada', status: 'success', duration: 2000 })
    await cargarTickets()
  }

  async function enviarMensaje(ev) {
    ev?.preventDefault?.()
    if (!seleccionado) return
    const texto = draft.trim()
    if (!texto) {
      toast({ title: 'Escriba un mensaje', status: 'warning', duration: 2500 })
      return
    }

    setEnviando(true)
    try {
      const token = await getToken()
      if (!token) throw new Error('Sin sesión. Vuelva a iniciar sesión.')

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/responder-contacto`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contacto_id: seleccionado.id,
            respuesta: texto,
            enviar_email: true,
            marcar_atendido: false,
            agente_nombre: yo,
          }),
        },
      )

      const raw = await res.text()
      let data = {}
      try {
        data = raw ? JSON.parse(raw) : {}
      } catch {
        throw new Error(`Respuesta inválida (${res.status}): ${raw.slice(0, 160)}`)
      }

      if (!res.ok) {
        if (data.mensaje_guardado) {
          setDraft('')
          await Promise.all([cargarTickets(), cargarMensajes(seleccionado.id)])
        }
        throw new Error(data.error || `Error ${res.status}`)
      }

      setDraft('')
      await Promise.all([cargarTickets(), cargarMensajes(seleccionado.id)])
      inputRef.current?.focus()

      if (data.email_ok) {
        toast({
          title: 'Mensaje enviado',
          description: `Correo entregado a ${data.to || seleccionado.email}`,
          status: 'success',
          duration: 4500,
        })
      } else {
        toast({
          title: 'Mensaje guardado',
          description: 'El correo no se confirmó. Revise el estado del mensaje en el chat.',
          status: 'warning',
          duration: 6000,
        })
      }
    } catch (e) {
      console.error('soporte chat', e)
      toast({
        title: 'No se pudo enviar el correo',
        description: e.message,
        status: 'error',
        duration: 10000,
      })
    } finally {
      setEnviando(false)
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  const agenteTicket = nombreAgente(seleccionado?.respondido_por)

  return (
    <Box maxW="78rem" h={{ lg: 'calc(100vh - 7rem)' }} display="flex" flexDirection="column">
      <Box flexShrink={0}>
        <PanelPageHeader
          icon={MessageSquare}
          titulo="Soporte"
          bajada="Conversaciones con clientes. Tome el ticket, responda por chat y cierre cuando esté listo."
          mb={4}
        />
      </Box>

      {error ? (
        <Text fontSize="sm" color="red.600" mb={3}>
          {error}
        </Text>
      ) : null}

      <Flex gap={2} flexWrap="wrap" mb={3} flexShrink={0}>
        {FILTROS.map((f) => (
          <Button
            key={f.id}
            size="sm"
            h="30px"
            borderRadius="full"
            variant={filtro === f.id ? 'solid' : 'outline'}
            bg={filtro === f.id ? 'brand.primary' : 'white'}
            color={filtro === f.id ? 'white' : 'blackAlpha.700'}
            borderColor="blackAlpha.200"
            onClick={() => setFiltro(f.id)}
          >
            {f.label}
            {typeof conteos[f.id] === 'number' ? ` (${conteos[f.id]})` : ''}
          </Button>
        ))}
      </Flex>

      <Flex
        flex="1"
        minH={0}
        borderWidth="1px"
        borderColor="blackAlpha.100"
        borderRadius="xl"
        overflow="hidden"
        bg="white"
        direction={{ base: 'column', md: 'row' }}
      >
        <Flex
          direction="column"
          w={{ base: 'full', md: '300px', lg: '340px' }}
          borderRightWidth={{ md: '1px' }}
          borderColor="blackAlpha.100"
          flexShrink={0}
          maxH={{ base: '40vh', md: 'none' }}
        >
          <Box p={3} borderBottomWidth="1px" borderColor="blackAlpha.100">
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar conversación…"
              h="40px"
              bg="blackAlpha.50"
              borderColor="transparent"
              _focus={{ bg: 'white', borderColor: 'brand.primary' }}
            />
          </Box>
          <Box overflowY="auto" flex="1">
            {loading ? (
              <Text p={4} fontSize="sm" color="blackAlpha.500">
                Cargando…
              </Text>
            ) : null}
            {!loading && visibles.length === 0 ? (
              <Text p={4} fontSize="sm" color="blackAlpha.500">
                No hay conversaciones aquí.
              </Text>
            ) : null}
            {visibles.map((t) => {
              const activo = t.id === seleccionadoId
              const estado = t.estado || 'pendiente'
              const agente = nombreAgente(t.respondido_por)
              return (
                <Box
                  key={t.id}
                  as="button"
                  type="button"
                  w="full"
                  textAlign="left"
                  px={4}
                  py={3}
                  bg={activo ? 'brand.wash' : 'white'}
                  borderBottomWidth="1px"
                  borderColor="blackAlpha.50"
                  borderLeftWidth="3px"
                  borderLeftColor={activo ? 'brand.primary' : 'transparent'}
                  _hover={{ bg: activo ? 'brand.wash' : 'blackAlpha.50' }}
                  onClick={() => setSeleccionadoId(t.id)}
                >
                  <Flex justify="space-between" gap={2} mb={0.5}>
                    <Text fontSize="sm" fontWeight="semibold" color="brand.ink" noOfLines={1}>
                      {t.nombre || 'Sin nombre'}
                    </Text>
                    <Text fontSize="10px" color="blackAlpha.500" flexShrink={0}>
                      {horaCorta(t.creado_en)}
                    </Text>
                  </Flex>
                  <Text fontSize="xs" color={COLOR[estado]} fontWeight="medium" mb={0.5}>
                    {ETIQUETA[estado]} · {(t.motivo || 'consulta').toUpperCase()}
                  </Text>
                  <Text fontSize="xs" color="blackAlpha.500" noOfLines={1} mb={1}>
                    {agente ? `Tomado por ${agente}` : 'Sin asignar'}
                  </Text>
                  <Text fontSize="xs" color="blackAlpha.600" noOfLines={2}>
                    {t.mensaje}
                  </Text>
                </Box>
              )
            })}
          </Box>
        </Flex>

        <Flex direction="column" flex="1" minW={0} minH={{ base: '50vh', md: 0 }}>
          {!seleccionado ? (
            <Flex flex="1" align="center" justify="center" p={8}>
              <Text color="blackAlpha.500" fontSize="sm">
                Elija una conversación a la izquierda.
              </Text>
            </Flex>
          ) : (
            <>
              <Box
                px={4}
                py={3}
                borderBottomWidth="1px"
                borderColor="blackAlpha.100"
                flexShrink={0}
                bg="white"
              >
                <Flex align="center" justify="space-between" gap={3}>
                  <Box minW={0}>
                    <Text fontWeight="semibold" color="brand.ink" noOfLines={1}>
                      {seleccionado.nombre || 'Sin nombre'}
                    </Text>
                    <Text fontSize="xs" color="blackAlpha.600" noOfLines={1}>
                      {seleccionado.email}
                      {seleccionado.empresa ? ` · ${seleccionado.empresa}` : ''}
                      {' · '}
                      <Text as="span" color={COLOR[seleccionado.estado || 'pendiente']} fontWeight="medium">
                        {ETIQUETA[seleccionado.estado || 'pendiente']}
                      </Text>
                    </Text>
                    <Text fontSize="xs" color="blackAlpha.500" mt={0.5} noOfLines={1}>
                      {agenteTicket
                        ? `Tomado por ${agenteTicket}${seleccionado.respondido_en ? ` · ${horaCorta(seleccionado.respondido_en)}` : ''}`
                        : 'Nadie ha tomado este ticket todavía'}
                    </Text>
                  </Box>
                  <Flex gap={2} flexShrink={0} flexWrap="wrap" justify="flex-end">
                    {(seleccionado.estado || 'pendiente') === 'pendiente' ? (
                      <Button
                        size="sm"
                        h="32px"
                        bg="brand.primary"
                        color="white"
                        _hover={{ bg: 'brand.primaryDark' }}
                        isLoading={cambiandoEstado}
                        onClick={tomarTicket}
                      >
                        Tomar
                      </Button>
                    ) : null}
                    {(seleccionado.estado || 'pendiente') !== 'atendido' ? (
                      <Button
                        size="sm"
                        h="32px"
                        variant="outline"
                        isLoading={cambiandoEstado}
                        onClick={() => cambiarEstado('atendido')}
                      >
                        Cerrar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        h="32px"
                        variant="ghost"
                        isLoading={cambiandoEstado}
                        onClick={() => cambiarEstado('en_curso')}
                      >
                        Reabrir
                      </Button>
                    )}
                    <Button
                      size="sm"
                      h="32px"
                      variant="ghost"
                      onClick={() => setMostrarOpciones((v) => !v)}
                    >
                      {mostrarOpciones ? 'Menos' : 'Más'}
                    </Button>
                  </Flex>
                </Flex>

                {mostrarOpciones ? (
                  <Box mt={3} pt={3} borderTopWidth="1px" borderColor="blackAlpha.100">
                    <Flex gap={2} flexWrap="wrap" mb={3}>
                      <Button
                        size="sm"
                        h="30px"
                        variant="outline"
                        isLoading={cambiandoEstado}
                        onClick={() => cambiarEstado('pendiente')}
                      >
                        Pendiente
                      </Button>
                      <Button
                        size="sm"
                        h="30px"
                        variant="outline"
                        isLoading={cambiandoEstado}
                        onClick={() => cambiarEstado('en_curso')}
                      >
                        En curso
                      </Button>
                      <Button
                        size="sm"
                        h="30px"
                        variant="outline"
                        isLoading={cambiandoEstado}
                        onClick={tomarTicket}
                      >
                        Asignarme
                      </Button>
                      {agenteTicket ? (
                        <Button
                          size="sm"
                          h="30px"
                          variant="ghost"
                          isLoading={cambiandoEstado}
                          onClick={soltarTicket}
                        >
                          Liberar
                        </Button>
                      ) : null}
                      <Button
                        as="a"
                        href={`mailto:${seleccionado.email}?subject=${encodeURIComponent(`Re: ${seleccionado.motivo || 'consulta'} · Inducta`)}`}
                        size="sm"
                        h="30px"
                        variant="ghost"
                      >
                        Abrir correo
                      </Button>
                      <Button
                        size="sm"
                        h="30px"
                        variant="ghost"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(seleccionado.email || '')
                            toast({ title: 'Correo copiado', status: 'success', duration: 1500 })
                          } catch {
                            toast({ title: 'No se pudo copiar', status: 'warning' })
                          }
                        }}
                      >
                        Copiar email
                      </Button>
                    </Flex>

                    <Text fontSize="xs" fontWeight="medium" color="blackAlpha.600" mb={1}>
                      Nota interna (solo equipo)
                    </Text>
                    <Textarea
                      value={notaDraft}
                      onChange={(e) => setNotaDraft(e.target.value)}
                      placeholder="Recordatorios, contexto, pendientes…"
                      rows={2}
                      resize="none"
                      bg="blackAlpha.50"
                      borderColor="transparent"
                      _focus={{ bg: 'white', borderColor: 'brand.primary' }}
                      mb={2}
                    />
                    <Button
                      size="sm"
                      h="30px"
                      variant="outline"
                      isLoading={guardandoNota}
                      onClick={guardarNota}
                      isDisabled={notaDraft === (seleccionado.nota_interna || '')}
                    >
                      Guardar nota
                    </Button>
                  </Box>
                ) : null}
              </Box>

              <Box flex="1" overflowY="auto" px={4} py={4} bg="blackAlpha.50">
                {loadingChat ? (
                  <Text fontSize="sm" color="blackAlpha.500">
                    Cargando mensajes…
                  </Text>
                ) : null}
                <VStack align="stretch" spacing={3}>
                  {mensajes.map((m) => {
                    const propio = m.autor === 'soporte'
                    const firma = propio
                      ? nombreAgente(m.creado_por, yo) || yo
                      : seleccionado.nombre || 'Cliente'
                    return (
                      <Flex key={m.id} justify={propio ? 'flex-end' : 'flex-start'}>
                        <Box
                          maxW={{ base: '92%', md: '75%' }}
                          bg={propio ? 'brand.primary' : 'white'}
                          color={propio ? 'white' : 'brand.ink'}
                          px={3.5}
                          py={2.5}
                          borderRadius="xl"
                          borderBottomRightRadius={propio ? 'sm' : 'xl'}
                          borderBottomLeftRadius={propio ? 'xl' : 'sm'}
                          borderWidth={propio ? 0 : '1px'}
                          borderColor="blackAlpha.100"
                        >
                          <Text fontSize="11px" opacity={0.75} mb={1} fontWeight="medium">
                            {firma}
                            {' · '}
                            {horaCorta(m.creado_en)}
                          </Text>
                          <Text fontSize="sm" whiteSpace="pre-wrap" lineHeight={1.55}>
                            {m.cuerpo}
                          </Text>
                          {propio ? (
                            <Text fontSize="10px" mt={1.5} opacity={0.8}>
                              {m.email_enviado
                                ? 'Correo enviado'
                                : m.email_error
                                  ? `Correo falló: ${m.email_error}`
                                  : 'Sin confirmación de correo'}
                            </Text>
                          ) : null}
                        </Box>
                      </Flex>
                    )
                  })}
                  <div ref={chatEndRef} />
                </VStack>
              </Box>

              <Box
                as="form"
                onSubmit={enviarMensaje}
                p={3}
                borderTopWidth="1px"
                borderColor="blackAlpha.100"
                bg="white"
                flexShrink={0}
              >
                <Textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Escriba su respuesta… (Enter envía, Shift+Enter salto de línea)"
                  rows={3}
                  resize="none"
                  bg="blackAlpha.50"
                  borderColor="transparent"
                  _focus={{ bg: 'white', borderColor: 'brand.primary' }}
                  mb={2}
                />
                <Flex justify="space-between" align="center" gap={3}>
                  <Text fontSize="xs" color="blackAlpha.500">
                    Se envía a {seleccionado.email}. Responder toma el ticket automáticamente.
                  </Text>
                  <Button
                    type="submit"
                    h="40px"
                    px={5}
                    bg="brand.primary"
                    color="white"
                    _hover={{ bg: 'brand.primaryDark' }}
                    isLoading={enviando}
                    loadingText="Enviando…"
                    isDisabled={!draft.trim()}
                  >
                    Enviar
                  </Button>
                </Flex>
              </Box>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}
