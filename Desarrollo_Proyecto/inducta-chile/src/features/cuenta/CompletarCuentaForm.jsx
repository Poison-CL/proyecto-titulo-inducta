import { Button, FormControl, FormLabel, Input, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'

export function CompletarCuentaForm({ onSubmit, isLoading }) {
  const [nombreComercial, setNombreComercial] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!nombreComercial.trim() || !email.trim() || password.length < 8) {
      setError('Complete nombre, correo válido y contraseña de al menos 8 caracteres.')
      return
    }
    if (password !== password2) {
      setError('Las contraseñas no coinciden.')
      return
    }
    onSubmit({
      nombre_comercial: nombreComercial.trim(),
      email: email.trim().toLowerCase(),
      password,
    })
  }

  return (
    <Stack as="form" spacing={4} onSubmit={handleSubmit}>
      <Text fontSize="sm" color="blackAlpha.700" lineHeight={1.55}>
        Estos datos reemplazan las credenciales temporales. El correo de pago queda solo como referencia histórica.
      </Text>
      <FormControl isRequired>
        <FormLabel fontSize="sm">Nombre comercial</FormLabel>
        <Input value={nombreComercial} onChange={(e) => setNombreComercial(e.target.value)} h="44px" />
      </FormControl>
      <FormControl isRequired>
        <FormLabel fontSize="sm">Correo real</FormLabel>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          h="44px"
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
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel fontSize="sm">Confirmar contraseña</FormLabel>
        <Input
          type="password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          autoComplete="new-password"
          h="44px"
        />
      </FormControl>
      {error && (
        <Text fontSize="sm" color="red.600">
          {error}
        </Text>
      )}
      <Button
        type="submit"
        bg="brand.primary"
        color="white"
        _hover={{ bg: 'brand.primaryDark' }}
        isLoading={isLoading}
        alignSelf="flex-start"
        h="44px"
      >
        Verificar cuenta
      </Button>
    </Stack>
  )
}
