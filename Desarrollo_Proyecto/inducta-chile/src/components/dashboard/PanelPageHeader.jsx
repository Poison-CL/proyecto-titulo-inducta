import { Box, Flex, Heading, Icon, Text } from '@chakra-ui/react'

/** Cabecera estándar de páginas internas del panel (empresa / empleado / admin). */
export default function PanelPageHeader({ icon: IconCmp, titulo, bajada, actions, mb = 8 }) {
  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      align={{ base: 'flex-start', md: 'flex-start' }}
      justify="space-between"
      gap={4}
      mb={mb}
    >
      <Flex align="flex-start" gap={3} minW={0}>
        {IconCmp ? (
          <Flex
            w="44px"
            h="44px"
            align="center"
            justify="center"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="blackAlpha.100"
            bg="brand.soft"
            flexShrink={0}
          >
            <Icon as={IconCmp} boxSize={5} color="brand.primary" strokeWidth={1.75} />
          </Flex>
        ) : null}
        <Box minW={0}>
          <Heading
            as="h1"
            fontSize={{ base: '1.75rem', md: '2.1rem' }}
            fontWeight="semibold"
            letterSpacing="-0.03em"
            lineHeight="1.15"
            color="brand.ink"
          >
            {titulo}
          </Heading>
          {bajada ? (
            <Text color="blackAlpha.600" fontSize="md" mt={1.5} lineHeight="1.5" maxW="52ch">
              {bajada}
            </Text>
          ) : null}
        </Box>
      </Flex>
      {actions ? (
        <Flex gap={3} flexWrap="wrap" flexShrink={0} pt={{ md: 1 }}>
          {actions}
        </Flex>
      ) : null}
    </Flex>
  )
}
