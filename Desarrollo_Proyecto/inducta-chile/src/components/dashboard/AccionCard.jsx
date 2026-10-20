import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

/** Card de acción del panel Inducta. */
export default function AccionCard({ icon: IconCmp, titulo, bajada, cta, to, primary, meta }) {
  return (
    <Box
      borderWidth="1px"
      borderColor="blackAlpha.100"
      borderRadius="xl"
      bg="white"
      overflow="hidden"
      display="flex"
      flexDirection="column"
      minH={{ md: '308px' }}
      transition="border-color 150ms"
      _hover={{ borderColor: 'blackAlpha.200' }}
    >
      <Flex
        h="148px"
        align="center"
        justify="center"
        borderBottomWidth="1px"
        borderColor="blackAlpha.100"
        bg="white"
        direction="column"
        gap={2}
        position="relative"
      >
        {/* puntos decorativos sutiles */}
        <Box
          position="absolute"
          w="4px"
          h="4px"
          borderRadius="full"
          bg="blackAlpha.200"
          top="28%"
          left="22%"
          aria-hidden
        />
        <Box
          position="absolute"
          w="3px"
          h="3px"
          borderRadius="full"
          bg="blackAlpha.200"
          top="36%"
          right="24%"
          aria-hidden
        />
        <Box
          position="absolute"
          w="3px"
          h="3px"
          borderRadius="full"
          bg="blackAlpha.100"
          bottom="30%"
          left="28%"
          aria-hidden
        />

        <Flex
          w="56px"
          h="56px"
          align="center"
          justify="center"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="blackAlpha.200"
          bg="white"
          boxShadow="0 1px 2px rgba(13,13,13,0.04)"
          zIndex={1}
        >
          <Icon as={IconCmp} boxSize={6} color="brand.ink" strokeWidth={1.4} />
        </Flex>
        {meta != null ? (
          <Text
            fontSize="xl"
            fontWeight="semibold"
            letterSpacing="-0.04em"
            color="brand.ink"
            lineHeight="1"
            zIndex={1}
          >
            {meta}
          </Text>
        ) : null}
      </Flex>

      <Flex direction="column" flex="1" px={5} pt={5} pb={5}>
        <Text fontSize="md" fontWeight="semibold" letterSpacing="-0.02em" color="brand.ink" mb={2}>
          {titulo}
        </Text>
        <Text fontSize="sm" color="blackAlpha.600" lineHeight="1.55" flex="1" mb={6}>
          {bajada}
        </Text>
        <Button
          as={RouterLink}
          to={to}
          h="40px"
          borderRadius="lg"
          w="full"
          fontSize="sm"
          fontWeight="semibold"
          {...(primary
            ? { bg: 'brand.primary', color: 'white', _hover: { bg: 'brand.primaryDark' } }
            : {
                variant: 'outline',
                borderColor: 'blackAlpha.200',
                bg: 'white',
                color: 'brand.ink',
                _hover: { bg: 'blackAlpha.50', borderColor: 'blackAlpha.300' },
              })}
        >
          {cta}
        </Button>
      </Flex>
    </Box>
  )
}
