import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { useAuth } from '@clerk/clerk-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import BusquedaFiltroBanner from '../../components/dashboard/BusquedaFiltroBanner'
import { useSupabase } from '../../hooks/useSupabase'
import { filtraPorCampos } from '../../lib/panelBusqueda'

export default function AdminUsuariosPage() {
  const supabase = useSupabase()
  const { getToken } = useAuth()
  const toast = useToast()
  const [params] = useSearchParams()
  const consulta = params.get('q')?.trim() || ''
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)

  const visibles = useMemo(
    () => filtraPorCampos(rows, consulta, ['nombre_completo', 'rut', 'id_usuario', 'id_empresa', 'rol']),
    [rows, consulta],
  )

  useEffect(() => {
    if (!consulta || loading) return
    requestAnimationFrame(() => {
      document.querySelector('[data-busqueda-hit]')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    })
  }, [consulta, loading, visibles])

  useEffect(() => {
    let vivo = true
    supabase
      .from('usuario')
      .select('id_usuario, id_empresa, nombre_completo, rol, activo, rut')
      .order('nombre_completo')
      .limit(100)
      .then(({ data, error: err }) => {
        if (!vivo) return
        if (err) setError(err.message)
        setRows(data || [])
        setLoading(false)
      })
    return () => {
      vivo = false
    }
  }, [supabase])

  async function resetPassword(ev) {
    ev.preventDefault()
    if (!userId.trim() || password.length < 8) {
      toast({
        title: 'Datos incompletos',
        description: 'Indique el id de usuario Clerk y una contraseña de al menos 8 caracteres.',
        status: 'error',
        duration: 4000,
      })
      return
    }
    setEnviando(true)
    try {
      const token = await getToken()
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-reset-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId.trim(), password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      toast({ title: 'Contraseña actualizada', status: 'success', duration: 4000 })
      setPassword('')
    } catch (e) {
      toast({
        title: 'No se pudo cambiar',
        description: e.message || 'La Edge Function admin-reset-password debe estar desplegada.',
        status: 'error',
        duration: 6000,
      })
    } finally {
      setEnviando(false)
    }
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
        Usuarios
      </Heading>
      <Text color="blackAlpha.700" fontSize={{ base: 'md', md: 'lg' }} lineHeight={1.6} maxW="44ch" mb={12}>
        Cuentas en Supabase y restablecimiento de contraseña vía Clerk (requiere Edge Function).
      </Text>

      <Box
        as="form"
        onSubmit={resetPassword}
        mb={14}
        maxW="28rem"
        p={6}
        bg="brand.soft"
        borderRadius="md"
        borderWidth="1px"
        borderColor="blackAlpha.100"
      >
        <Text fontWeight="semibold" color="brand.ink" mb={1} letterSpacing="-0.02em">
          Cambiar contraseña
        </Text>
        <Text fontSize="sm" color="blackAlpha.600" mb={5} lineHeight={1.5}>
          Use el id de Clerk del listado (user_…).
        </Text>
        <VStack align="stretch" spacing={4}>
          <FormControl isRequired>
            <FormLabel fontSize="sm">Clerk user id</FormLabel>
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="user_…"
              h="44px"
              bg="white"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel fontSize="sm">Nueva contraseña</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              h="44px"
              bg="white"
            />
          </FormControl>
          <Button type="submit" alignSelf="flex-start" isLoading={enviando} h="44px" px={7}>
            Guardar contraseña
          </Button>
        </VStack>
      </Box>

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

      <Text fontSize="xs" color="blackAlpha.500" fontWeight="medium" letterSpacing="0.02em" mb={3}>
        LISTADO
      </Text>
      <VStack align="stretch" spacing={0} borderTopWidth="1px" borderColor="blackAlpha.100">
        {visibles.map((u) => (
          <Box
            key={u.id_usuario}
            py={5}
            px={consulta ? 3 : 0}
            borderBottomWidth="1px"
            borderColor="blackAlpha.100"
            bg={consulta ? 'brand.wash' : undefined}
            borderRadius={consulta ? 'md' : undefined}
            data-busqueda-hit={consulta || undefined}
          >
            <Text fontWeight="semibold" color="brand.ink">
              {u.nombre_completo || 'Sin nombre'}
            </Text>
            <Text fontSize="sm" color="blackAlpha.600" mt={1.5} wordBreak="break-all">
              {u.id_usuario}
            </Text>
            <Text fontSize="sm" color="blackAlpha.500" mt={1}>
              {u.rol} · {u.activo === false ? 'inactivo' : 'activo'} · empresa {u.id_empresa}
            </Text>
            <Button
              size="sm"
              variant="link"
              color="brand.primary"
              mt={2}
              fontWeight="semibold"
              onClick={() => setUserId(u.id_usuario)}
            >
              Usar este id
            </Button>
          </Box>
        ))}
        {!loading && rows.length === 0 && (
          <Text py={12} fontSize="sm" color="blackAlpha.600">
            No hay usuarios en la base.
          </Text>
        )}
        {!loading && rows.length > 0 && visibles.length === 0 && (
          <Text py={12} fontSize="sm" color="blackAlpha.600">
            Ningún usuario coincide con la búsqueda.
          </Text>
        )}
      </VStack>
    </Box>
  )
}
