import { Box, Flex, Icon, Text } from '@chakra-ui/react'

/** Card de configuración del panel. */
export default function SettingsCard({ icon: IconCmp, titulo, bajada, footer, children, ...rest }) {
  return (
    <Box
      borderWidth="1px"
      borderColor="blackAlpha.100"
      borderRadius="xl"
      bg="white"
      overflow="hidden"
      {...rest}
    >
      {(titulo || IconCmp) && (
        <Flex align="flex-start" gap={3} px={5} pt={5} pb={titulo || bajada ? 4 : 0}>
          {IconCmp ? (
            <Flex
              w="36px"
              h="36px"
              align="center"
              justify="center"
              borderRadius="md"
              borderWidth="1px"
              borderColor="blackAlpha.100"
              bg="brand.soft"
              flexShrink={0}
            >
              <Icon as={IconCmp} boxSize={4} color="brand.primary" strokeWidth={1.75} />
            </Flex>
          ) : null}
          <Box minW={0} flex="1">
            {titulo ? (
              <Text fontSize="md" fontWeight="semibold" letterSpacing="-0.02em" color="brand.ink">
                {titulo}
              </Text>
            ) : null}
            {bajada ? (
              <Text fontSize="sm" color="blackAlpha.600" mt={0.5} lineHeight="1.45">
                {bajada}
              </Text>
            ) : null}
          </Box>
        </Flex>
      )}
      {children ? <Box px={5} pb={footer ? 0 : 5}>{children}</Box> : null}
      {footer ? (
        <Flex
          align="center"
          justify="flex-end"
          gap={3}
          px={5}
          py={3}
          mt={4}
          borderTopWidth="1px"
          borderColor="blackAlpha.100"
          bg="blackAlpha.50"
        >
          {footer}
        </Flex>
      ) : null}
    </Box>
  )
}

export function SettingsRow({ label, children, last }) {
  return (
    <Flex
      justify="space-between"
      align="center"
      gap={4}
      py={3.5}
      borderBottomWidth={last ? 0 : '1px'}
      borderColor="blackAlpha.100"
    >
      <Text fontSize="sm" color="blackAlpha.600" flexShrink={0}>
        {label}
      </Text>
      <Box fontSize="sm" fontWeight="medium" color="brand.ink" textAlign="right" minW={0}>
        {children}
      </Box>
    </Flex>
  )
}
