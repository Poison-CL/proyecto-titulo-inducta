import { Box, Spinner, Text, VStack } from '@chakra-ui/react'
import { AUTH_COPY } from '../../lib/authCopy'

export default function AuthLoading({ mensaje = AUTH_COPY.loading.sesion }) {
  return (
    <Box minH="100vh" bg="brand.soft" display="flex" alignItems="center" justifyContent="center">
      <VStack spacing={4}>
        <Spinner size="lg" color="brand.primary" thickness="3px" />
        <Text color="gray.600" fontSize="sm">
          {mensaje}
        </Text>
      </VStack>
    </Box>
  )
}
