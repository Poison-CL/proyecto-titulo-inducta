import { Box, Button, Text } from '@chakra-ui/react'

/**
 * Caja que aparece en el dashboard de empresa cuando la org
 * todavía no está sincronizada con Supabase.
 */
export default function SincronizarEmpresaBox({ loading, error, onSync }) {
  return (
    <Box
      borderWidth="1px"
      borderColor="blackAlpha.100"
      borderRadius="xl"
      p={{ base: 6, md: 8 }}
      textAlign="center"
      maxW="28rem"
      mx="auto"
    >
      <Text fontSize="xl" fontWeight="semibold" letterSpacing="-0.02em" color="brand.ink" mb={3}>
        Sincronizar empresa
      </Text>
      <Text color="blackAlpha.700" lineHeight="1.6" mb={error ? 3 : 6}>
        Falta registrar esta organización en la base de datos para gestionar plan y equipo.
      </Text>
      {error ? (
        <Text color="red.600" fontSize="sm" mb={5}>
          {error}
        </Text>
      ) : null}
      <Button
        onClick={onSync}
        isLoading={loading}
        loadingText="Sincronizando"
        h="44px"
        px={7}
        borderRadius="md"
        w="full"
      >
        Sincronizar ahora
      </Button>
    </Box>
  )
}
