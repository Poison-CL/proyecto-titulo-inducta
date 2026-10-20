import {
  Box,
  Button,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Kbd,
  Text,
  VStack,
} from '@chakra-ui/react'
import { ChevronRight, Search, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'

/** Hero del panel. onBuscar(q) → Promise<{ to?, msg? }> */
export default function WorkspaceHome({
  pillLabel,
  pillTo,
  titulo,
  placeholder,
  onBuscar,
  children,
}) {
  const inputRef = useRef(null)
  const [q, setQ] = useState('')
  const [msg, setMsg] = useState('')
  const [buscando, setBuscando] = useState(false)

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        e.stopPropagation()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])

  async function submit(e) {
    e.preventDefault()
    if (!onBuscar) return
    setBuscando(true)
    setMsg('')
    try {
      const r = await onBuscar(q)
      if (!r?.to) {
        setMsg(r?.msg || 'Sin coincidencia en el panel.')
        return
      }
      setQ('')
    } catch {
      setMsg('No se pudo completar la búsqueda.')
    } finally {
      setBuscando(false)
    }
  }

  return (
    <Box maxW="56rem" mx="auto" pt={{ base: 4, md: 10 }} data-tour="dash-resumen">
      <VStack spacing={0} textAlign="center" mb={{ base: 12, md: 16 }}>
        <Button
          as={RouterLink}
          to={pillTo}
          size="sm"
          variant="outline"
          borderRadius="full"
          h="32px"
          px={3.5}
          mb={7}
          fontWeight="medium"
          fontSize="xs"
          borderColor="blackAlpha.200"
          color="blackAlpha.700"
          bg="white"
          leftIcon={<Icon as={Sparkles} boxSize={3.5} color="brand.primary" />}
          rightIcon={<ChevronRight size={14} strokeWidth={2} />}
          _hover={{ bg: 'blackAlpha.50', borderColor: 'blackAlpha.300' }}
        >
          {pillLabel}
        </Button>

        <Heading
          as="h1"
          fontSize={{ base: '2rem', md: '2.75rem' }}
          fontWeight="semibold"
          letterSpacing="-0.045em"
          lineHeight="1.1"
          color="brand.ink"
          mb={9}
          maxW="18ch"
        >
          {titulo}
        </Heading>

        <Box as="form" onSubmit={submit} w="full" maxW="34rem">
          <InputGroup size="md">
            <InputLeftElement pointerEvents="none" h="46px" w="3rem">
              <Icon as={Search} boxSize={4} color="blackAlpha.400" />
            </InputLeftElement>
            <Input
              ref={inputRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                if (msg) setMsg('')
              }}
              placeholder={placeholder}
              aria-label="Buscar en el panel"
              h="46px"
              pl="3rem"
              pr="4.5rem"
              borderRadius="full"
              borderColor="blackAlpha.200"
              focusBorderColor="brand.primary"
              bg="white"
              fontSize="sm"
              isDisabled={buscando}
              _placeholder={{ color: 'blackAlpha.400' }}
              _hover={{ borderColor: 'blackAlpha.300' }}
            />
            <InputRightElement w="4.25rem" pr={3} h="46px" pointerEvents="none">
              <Kbd
                fontSize="10px"
                display={{ base: 'none', sm: 'inline-flex' }}
                bg="blackAlpha.50"
                borderColor="blackAlpha.200"
                color="blackAlpha.500"
                borderRadius="md"
              >
                Ctrl K
              </Kbd>
            </InputRightElement>
          </InputGroup>
          {msg ? (
            <Text fontSize="sm" color="blackAlpha.600" mt={2} textAlign="left" px={2}>
              {msg}
            </Text>
          ) : null}
        </Box>
      </VStack>

      {children}
    </Box>
  )
}
