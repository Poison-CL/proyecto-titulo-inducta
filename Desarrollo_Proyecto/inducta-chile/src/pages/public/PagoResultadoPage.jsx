import { Box, Button, Container, Flex, Heading, Icon, Link, Text } from '@chakra-ui/react'
import { CheckCircle2, ChevronRight, CircleAlert, CircleX } from 'lucide-react'
import { Link as RouterLink, useLocation, useSearchParams } from 'react-router-dom'

const ESTADOS = {
  exitoso: {
    icon: CheckCircle2,
    color: 'brand.primary',
    etiqueta: 'Pago autorizado',
    titulo: 'Pago exitoso',
    cuerpo:
      'Su pago fue autorizado por Webpay. En breve le enviaremos la confirmación de su plan a su correo.',
    cta: { to: '/entrar?rol=empresa', label: 'Ingresar a la plataforma' },
    secundario: { to: '/', label: 'Ir al inicio' },
  },
  rechazado: {
    icon: CircleX,
    color: 'red.600',
    etiqueta: 'Pago no autorizado',
    titulo: 'Pago rechazado',
    cuerpo:
      'Webpay no autorizó la transacción. No se realizó ningún cargo. Puede intentar nuevamente con otro medio de pago.',
    cta: { to: '/precios', label: 'Volver a planes' },
    secundario: { to: '/contacto?motivo=soporte', label: 'Contactar soporte' },
  },
  anulado: {
    icon: CircleAlert,
    color: 'blackAlpha.700',
    etiqueta: 'Pago cancelado',
    titulo: 'Compra anulada',
    cuerpo:
      'Canceló el pago en Webpay. Su compra fue anulada y no se generó ningún cargo. Puede retomar la contratación cuando lo desee.',
    cta: { to: '/precios', label: 'Volver a planes' },
    secundario: { to: '/contacto?motivo=soporte', label: 'Contactar soporte' },
  },
}

function estadoDesdeRuta(pathname) {
  if (pathname.endsWith('/exitoso')) return 'exitoso'
  if (pathname.endsWith('/rechazado')) return 'rechazado'
  return 'anulado'
}

export default function PagoResultadoPage() {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const vista = ESTADOS[estadoDesdeRuta(pathname)]
  const orden = params.get('orden')
  const monto = params.get('monto')
  const cuentaTemporal = params.get('cuenta') === 'temporal'
  const cuerpo = params.get('error')
    ? 'No pudimos confirmar el pago con Webpay. Si ve un cargo en su cuenta, escríbanos indicando la fecha y el monto.'
    : cuentaTemporal && estadoDesdeRuta(pathname) === 'exitoso'
      ? 'Su pago fue autorizado. Le enviamos un correo con credenciales temporales de acceso. Debe reemplazarlas por datos reales en menos de 24 horas.'
      : vista.cuerpo
  const detalle = [
    ...(orden ? [['Orden', orden]] : []),
    ...(monto ? [['Monto', `$${Number(monto).toLocaleString('es-CL')}`]] : []),
  ]

  return (
    <Box bg="white" py={{ base: 16, md: 28 }}>
      <Container maxW="3xl" px={{ base: 5, md: 8 }}>
        <Flex align="center" gap={2} color={vista.color} fontWeight="semibold" mb={3}>
          <Icon as={vista.icon} boxSize={5} aria-hidden />
          <Text>{vista.etiqueta}</Text>
        </Flex>
        <Heading
          as="h1"
          fontSize={{ base: '2.2rem', md: '3rem' }}
          fontWeight="semibold"
          letterSpacing="-0.04em"
          lineHeight="1.05"
          color="brand.ink"
          mb={4}
        >
          {vista.titulo}
        </Heading>
        <Text color="blackAlpha.700" fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.6" maxW="52ch">
          {cuerpo}
        </Text>

        {detalle.length ? (
          <Box as="dl" mt={8} borderTopWidth="1px" borderColor="blackAlpha.100" maxW="md">
            {detalle.map(([label, valor]) => (
              <Flex key={label} justify="space-between" py={3} borderBottomWidth="1px" borderColor="blackAlpha.100" fontSize="sm">
                <Text as="dt" color="blackAlpha.600">
                  {label}
                </Text>
                <Text as="dd" fontWeight="medium" color="brand.ink" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {valor}
                </Text>
              </Flex>
            ))}
          </Box>
        ) : null}

        <Flex gap={7} wrap="wrap" align="center" mt={10}>
          <Button as={RouterLink} to={vista.cta.to} h="46px" px={7} bg="brand.primary" color="white" _hover={{ bg: 'brand.primaryDark' }}>
            {vista.cta.label}
          </Button>
          <Link
            as={RouterLink}
            to={vista.secundario.to}
            display="inline-flex"
            alignItems="center"
            gap={1}
            fontWeight="medium"
            color="brand.primary"
          >
            {vista.secundario.label} <ChevronRight size={18} aria-hidden />
          </Link>
        </Flex>
      </Container>
    </Box>
  )
}
