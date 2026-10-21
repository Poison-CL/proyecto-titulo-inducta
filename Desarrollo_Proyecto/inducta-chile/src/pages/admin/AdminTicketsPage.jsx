import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useSupabase } from '../../hooks/useSupabase'

export default function AdminTicketsPage() {
  const supabase = useSupabase()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let vivo = true
    supabase
      .from('contactos')
      .select('id, creado_en, motivo, nombre, empresa, email, mensaje')
      .order('creado_en', { ascending: false })
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
        Tickets
      </Heading>
      <Text color="blackAlpha.700" fontSize={{ base: 'md', md: 'lg' }} lineHeight={1.6} maxW="44ch" mb={12}>
        Mensajes recibidos por el sitio (contacto / soporte).
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

      <VStack align="stretch" spacing={0} borderTopWidth="1px" borderColor="blackAlpha.100">
        {rows.map((r) => (
          <Box key={r.id} py={6} borderBottomWidth="1px" borderColor="blackAlpha.100">
            <Text fontSize="xs" color="blackAlpha.500" fontWeight="medium" letterSpacing="0.02em" mb={2}>
              {(r.motivo || 'Consulta').toUpperCase()}
            </Text>
            <Text fontWeight="semibold" color="brand.ink" fontSize="md">
              {r.nombre || 'Sin nombre'}
            </Text>
            <Text fontSize="sm" color="blackAlpha.600" mt={1.5}>
              {r.email}
              {r.empresa ? ` · ${r.empresa}` : ''}
              {r.creado_en ? ` · ${new Date(r.creado_en).toLocaleString('es-CL')}` : ''}
            </Text>
            <Text fontSize="sm" color="blackAlpha.700" mt={4} lineHeight={1.6} whiteSpace="pre-wrap" maxW="48ch">
              {r.mensaje}
            </Text>
          </Box>
        ))}
        {!loading && rows.length === 0 && (
          <Text py={12} fontSize="sm" color="blackAlpha.600">
            No hay mensajes todavía.
          </Text>
        )}
      </VStack>
    </Box>
  )
}
