import { Box, Button, Container, Heading, Icon, Text, VStack } from '@chakra-ui/react'
import { CheckCircle2, CircleAlert, CircleX } from 'lucide-react'
import { Link as RouterLink, useLocation, useSearchParams } from 'react-router-dom'

const ESTADOS = {
  exitoso: {
    icon: CheckCircle2,
    color: 'brand.primary',
    titulo: 'Pago exitoso',
    cuerpo:
      'Su pago fue autorizado por Webpay. En breve le enviaremos la confirmación de su plan a su correo.',
    cta: { to: '/entrar?rol=empresa', label: 'Ingresar a la plataforma' },
  },
  rechazado: {
    icon: CircleX,
    color: 'red.500',
    titulo: 'Pago rechazado',
    cuerpo:
      'Webpay no autorizó la transacción. No se realizó ningún cargo. Puede intentar nuevamente con otro medio de pago.',
    cta: { to: '/precios', label: 'Volver a planes' },
  },
  anulado: {
    icon: CircleAlert,
    color: 'orange.500',
    titulo: 'Compra anulada',
    cuerpo:
      'Canceló el pago en Webpay. Su compra fue anulada y no se generó ningún cargo. Puede retomar la contratación cuando lo desee.',
    cta: { to: '/precios', label: 'Volver a planes' },
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
  const key = estadoDesdeRuta(pathname)
  const vista = ESTADOS[key]
  const orden = params.get('orden')
  const monto = params.get('monto')

  return (
    <Box bg="brand.soft" py={{ base: 16, md: 24 }} minH="70vh">
      <Container maxW="lg">
        <VStack
          spacing={5}
          align="stretch"
          bg="white"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="blackAlpha.100"
          borderTopWidth="4px"
          borderTopColor={vista.color}
          p={{ base: 6, md: 10 }}
          boxShadow="sm"
          textAlign="center"
        >
          <Icon as={vista.icon} boxSize={12} color={vista.color} mx="auto" />
          <Heading as="h1" size="lg" color="brand.ink">
            {vista.titulo}
          </Heading>
          <Text color="blackAlpha.600" lineHeight="1.7">
            {vista.cuerpo}
          </Text>
          {(orden || monto) && (
            <Box bg="brand.wash" borderRadius="md" p={4} textAlign="left">
              {orden ? (
                <Text fontSize="sm" color="brand.ink">
                  Orden: <Text as="span" fontWeight="semibold">{orden}</Text>
                </Text>
              ) : null}
              {monto ? (
                <Text fontSize="sm" color="brand.ink" mt={orden ? 1 : 0}>
                  Monto:{' '}
                  <Text as="span" fontWeight="semibold">
                    ${Number(monto).toLocaleString('es-CL')}
                  </Text>
                </Text>
              ) : null}
            </Box>
          )}
          <Button as={RouterLink} to={vista.cta.to} size="lg" width="full">
            {vista.cta.label}
          </Button>
          {key !== 'exitoso' ? (
            <Button as={RouterLink} to="/contacto" variant="ghost" width="full">
              Contactar soporte
            </Button>
          ) : (
            <Button as={RouterLink} to="/" variant="ghost" width="full">
              Ir al inicio
            </Button>
          )}
        </VStack>
      </Container>
    </Box>
  )
}