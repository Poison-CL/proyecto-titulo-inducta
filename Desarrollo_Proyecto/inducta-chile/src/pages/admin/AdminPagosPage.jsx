import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useSupabase } from '../../hooks/useSupabase'

export default function AdminPagosPage() {
  const supabase = useSupabase()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let vivo = true
    supabase
      .from('pagos_transbank')
      .select(
        'id_pago, orden_compra, monto, estado, plan_solicitado, periodo, email_contacto, nombre_comercial, fecha_pago, id_empresa',
      )
      .order('id_pago', { ascending: false })
      .limit(80)
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
        Pagos
      </Heading>
      <Text color="blackAlpha.700" fontSize={{ base: 'md', md: 'lg' }} lineHeight={1.6} maxW="44ch" mb={4}>
        Historial de pagos Transbank. Para renovar un plan, edite la empresa o use contratar.
      </Text>
      <Button
        as={RouterLink}
        to="/admin/empresas"
        variant="link"
        color="brand.primary"
        fontWeight="semibold"
        p={0}
        h="auto"
        mb={12}
        fontSize="sm"
      >
        Renovar desde Empresas →
      </Button>

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
        {rows.map((p) => (
          <Box key={p.id_pago} py={5} borderBottomWidth="1px" borderColor="blackAlpha.100">
            <Text fontSize="xs" color="blackAlpha.500" fontWeight="medium" letterSpacing="0.02em" mb={2}>
              {(p.estado || 'sin estado').toUpperCase()}
            </Text>
            <Text fontWeight="semibold" color="brand.ink">
              {p.nombre_comercial || 'Sin nombre'}
            </Text>
            <Text fontSize="sm" color="blackAlpha.600" mt={1.5}>
              Orden {p.orden_compra || '—'} · plan {p.plan_solicitado || '—'} · {p.periodo || '—'}
            </Text>
            <Text fontSize="sm" color="brand.ink" fontWeight="medium" mt={2}>
              ${Number(p.monto || 0).toLocaleString('es-CL')}
            </Text>
            <Text fontSize="sm" color="blackAlpha.500" mt={1}>
              {p.fecha_pago ? new Date(p.fecha_pago).toLocaleString('es-CL') : 'Sin fecha'}
              {p.email_contacto ? ` · ${p.email_contacto}` : ''}
            </Text>
          </Box>
        ))}
        {!loading && rows.length === 0 && (
          <Text py={12} fontSize="sm" color="blackAlpha.600">
            No hay pagos registrados.
          </Text>
        )}
      </VStack>
    </Box>
  )
}
