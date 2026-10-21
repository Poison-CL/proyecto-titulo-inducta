import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useSupabase } from '../../hooks/useSupabase'
import { estadoPlan, fechaCortaEs } from '../../lib/planes'

export default function AdminResumenPage() {
  const supabase = useSupabase()
  const [stats, setStats] = useState({ empresas: 0, porVencer: 0, tickets: 0, pagos: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let vivo = true
    ;(async () => {
      const [emp, cont, pagos] = await Promise.all([
        supabase.from('empresa').select('id_empresa, plan_vence_en, cuenta_estado'),
        supabase.from('contactos').select('id', { count: 'exact', head: true }),
        supabase.from('pagos_transbank').select('id_pago', { count: 'exact', head: true }),
      ])
      if (!vivo) return
      const empresas = emp.data || []
      const porVencer = empresas.filter((e) => {
        const s = estadoPlan(e.plan_vence_en)
        return s.estado === 'por_vencer' || s.estado === 'vencido'
      }).length
      setStats({
        empresas: empresas.length,
        porVencer,
        tickets: cont.count ?? 0,
        pagos: pagos.count ?? 0,
      })
      setLoading(false)
    })()
    return () => {
      vivo = false
    }
  }, [supabase])

  const cards = [
    { label: 'Empresas', value: stats.empresas, to: '/admin/empresas', hint: 'Cuentas activas en la base' },
    {
      label: 'Planes al límite',
      value: stats.porVencer,
      to: '/admin/empresas',
      hint: 'Por vencer o vencidos',
      alert: stats.porVencer > 0,
    },
    { label: 'Tickets', value: stats.tickets, to: '/admin/tickets', hint: 'Contactos del sitio' },
    { label: 'Pagos', value: stats.pagos, to: '/admin/pagos', hint: 'Registros Transbank' },
  ]

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
        Resumen
      </Heading>
      <Text color="blackAlpha.700" fontSize={{ base: 'md', md: 'lg' }} lineHeight={1.6} maxW="42ch" mb={2}>
        Panel de la organización Inducta: soporte, cuentas y planes.
      </Text>
      <Text fontSize="xs" color="blackAlpha.500" mb={12}>
        Hoy · {fechaCortaEs(new Date().toISOString().slice(0, 10))}
      </Text>

      {loading ? (
        <Text color="blackAlpha.600" fontSize="sm">
          Cargando…
        </Text>
      ) : (
        <Flex
          direction={{ base: 'column', md: 'row' }}
          flexWrap="wrap"
          borderTopWidth="1px"
          borderColor="blackAlpha.100"
        >
          {cards.map((c) => (
            <Box
              key={c.label}
              flex="1"
              minW={{ md: '12rem' }}
              py={10}
              px={{ base: 0, md: 6 }}
              borderBottomWidth="1px"
              borderRightWidth={{ md: '1px' }}
              borderColor="blackAlpha.100"
              _last={{ borderRightWidth: 0 }}
            >
              <Text fontSize="xs" color="blackAlpha.500" fontWeight="medium" letterSpacing="0.02em" mb={3}>
                {c.label.toUpperCase()}
              </Text>
              <Text
                fontSize="2.75rem"
                fontWeight="semibold"
                letterSpacing="-0.04em"
                lineHeight="1"
                color={c.alert ? 'orange.700' : 'brand.ink'}
                mb={2}
              >
                {c.value}
              </Text>
              <Text fontSize="sm" color="blackAlpha.600" mb={5} lineHeight={1.45}>
                {c.hint}
              </Text>
              <Button
                as={RouterLink}
                to={c.to}
                variant="link"
                color="brand.primary"
                fontWeight="semibold"
                p={0}
                h="auto"
                fontSize="sm"
              >
                Ver →
              </Button>
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  )
}
