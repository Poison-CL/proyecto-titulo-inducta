import { Box, Button, Flex, IconButton, Text } from '@chakra-ui/react'
import { X } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'

// Se puede cerrar, pero no guardamos nada: vuelve a aparecer al recargar
export default function AnnouncementBanner({ onClose }) {
  return (
    <Box
      bg="#E8F1F8"
      borderBottomWidth="1px"
      borderColor="blackAlpha.100"
      px={{ base: 3, md: 6 }}
      py={{ base: 2.5, md: 2 }}
    >
      <Flex
        maxW="6xl"
        mx="auto"
        align="center"
        justify="center"
        gap={{ base: 2, md: 4 }}
        position="relative"
        pr={{ base: 8, md: 10 }}
      >
        <Flex
          align="center"
          direction="row"
          gap={{ base: 2, md: 3 }}
          flex="1"
          justify="center"
          minW={0}
        >
          <Text
            fontSize={{ base: 'xs', md: 'sm' }}
            color="brand.primary"
            lineHeight="1.35"
            noOfLines={{ base: 2, md: 1 }}
          >
            <Text as="span" fontWeight="bold">
              ¿Quieres probar el sitio sin costo?
            </Text>{' '}
            <Text as="span" fontWeight="normal" display={{ base: 'none', md: 'inline' }}>
              Explora todo lo que Inducta Chile tiene para ti.
            </Text>
          </Text>

          <Button
            as={RouterLink}
            to="/contacto"
            size="sm"
            h="32px"
            px={{ base: 3, md: 4 }}
            variant="outline"
            borderRadius="full"
            borderColor="brand.primary"
            color="brand.primary"
            bg="transparent"
            fontWeight="bold"
            fontSize="xs"
            flexShrink={0}
            _hover={{ bg: 'white', borderColor: 'brand.primary' }}
          >
            Ver demo gratis
          </Button>
        </Flex>

        <IconButton
          aria-label="Cerrar anuncio"
          icon={<X size={16} />}
          size="sm"
          variant="ghost"
          color="gray.500"
          minW="28px"
          h="28px"
          position="absolute"
          right={0}
          top={{ base: 0, md: '50%' }}
          transform={{ base: 'none', md: 'translateY(-50%)' }}
          onClick={onClose}
          _hover={{ bg: 'blackAlpha.50', color: 'brand.ink' }}
        />
      </Flex>
    </Box>
  )
}
