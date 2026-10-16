import { useState } from 'react'
import { Box, Button, Flex, Heading, HStack, Icon, Link, LinkBox, LinkOverlay, SimpleGrid, Text } from '@chakra-ui/react'
import { Clock, Mail } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import { EncabezadoRecurso } from '../../layouts/RecursosLayout'
import { buscar, getArticulo } from '../../lib/recursos'
import { Buscador, CabeceraTemas, FilaArticulo, SinResultados } from './RecursosPage'

const FRECUENTES = ['codigo-verificacion', 'ingresar-empresa-empleado', 'crear-accesos', 'planes-y-pago'].map(getArticulo)

export default function SoportePage() {
  const [consulta, setConsulta] = useState('')
  const buscando = consulta.trim().length > 0
  const resultados = buscando ? [...buscar('documentacion', consulta), ...buscar('guias', consulta)] : []

  return (
    <Box>
      <EncabezadoRecurso titulo="Soporte" bajada="Busque una respuesta o escríbanos.">
        <Buscador
          value={consulta}
          onChange={setConsulta}
          placeholder="¿En qué le podemos ayudar?"
          label="Buscar en guías y documentación"
        />
      </EncabezadoRecurso>

      <Flex direction={{ base: 'column', xl: 'row' }} gap={{ base: 10, xl: 12 }} align="flex-start">
        <Box as="section" flex="1" minW={0} w="full">
          <Heading as="h2" fontSize="lg" fontWeight="semibold" letterSpacing="-0.01em" mb={4}>
            {buscando ? 'Resultados' : 'Problemas frecuentes'}
          </Heading>

          {buscando ? (
            <>
              <CabeceraTemas />
              {resultados.length === 0 ? (
                <SinResultados consulta={consulta} />
              ) : (
                resultados.map((a) => <FilaArticulo key={a.slug} articulo={a} nivel="h3" />)
              )}
            </>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              {FRECUENTES.map((a) => (
                <LinkBox
                  key={a.slug}
                  borderWidth="1px"
                  borderColor="blackAlpha.100"
                  borderRadius="lg"
                  p={5}
                  transition="background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{ bg: 'brand.soft', borderColor: 'blackAlpha.200' }}
                  _active={{ bg: 'blackAlpha.50' }}
                >
                  <Text fontSize="sm" fontWeight="medium" color="brand.primary" mb={1}>
                    {a.categoria}
                  </Text>
                  <Text as="h3" fontWeight="semibold" color="brand.ink" lineHeight="1.35">
                    <LinkOverlay as={RouterLink} to={`/recursos/${a.slug}`}>
                      {a.titulo}
                    </LinkOverlay>
                  </Text>
                  <Text fontSize="sm" color="blackAlpha.600" mt={1} lineHeight="1.55">
                    {a.resumen}
                  </Text>
                </LinkBox>
              ))}
            </SimpleGrid>
          )}
        </Box>

        <Box as="aside" w={{ base: 'full', xl: '280px' }} flexShrink={0} borderWidth="1px" borderColor="blackAlpha.100" borderRadius="lg" p={5}>
          <Heading as="h2" fontSize="md" fontWeight="semibold" mb={4}>
            ¿No encontró lo que buscaba?
          </Heading>
          <HStack spacing={2.5} mb={2.5} fontSize="sm">
            <Icon as={Mail} boxSize={4} color="brand.primary" />
            <Link href="mailto:contacto@inductachile.cl" fontWeight="medium">
              contacto@inductachile.cl
            </Link>
          </HStack>
          <HStack spacing={2.5} mb={5} fontSize="sm">
            <Icon as={Clock} boxSize={4} color="brand.primary" />
            <Text color="brand.ink">Respondemos en días hábiles.</Text>
          </HStack>
          <Button as={RouterLink} to="/contacto" size="sm" w="full">
            Escribir a soporte
          </Button>
        </Box>
      </Flex>
    </Box>
  )
}
