import { Button, Flex, Text } from '@chakra-ui/react'
import { useNavigate, useLocation } from 'react-router-dom'

/** Aviso cuando la lista está filtrada por ?q= de la búsqueda del panel. */
export default function BusquedaFiltroBanner({ consulta, total, visibles }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  if (!consulta) return null

  return (
    <Flex
      align={{ base: 'flex-start', sm: 'center' }}
      justify="space-between"
      gap={3}
      mb={6}
      px={4}
      py={3}
      bg="brand.wash"
      borderRadius="md"
      direction={{ base: 'column', sm: 'row' }}
    >
      <Text fontSize="sm" color="brand.ink" lineHeight={1.5}>
        {visibles === 0
          ? `Sin coincidencias para «${consulta}».`
          : `${visibles} de ${total} resultado${visibles === 1 ? '' : 's'} para «${consulta}».`}
      </Text>
      <Button
        size="sm"
        variant="ghost"
        h="32px"
        fontWeight="semibold"
        color="brand.primary"
        onClick={() => navigate(pathname, { replace: true })}
      >
        Limpiar
      </Button>
    </Flex>
  )
}
