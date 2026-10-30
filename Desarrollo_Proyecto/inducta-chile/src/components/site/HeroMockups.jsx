import { Box, Flex, Grid, HStack, Icon, Image, Kbd, Progress, Text, VStack } from '@chakra-ui/react'
import {
  Award,
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  Home,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react'

// Decoración del hero: datos inventados, no vienen de la API.

const iconTile = [
  { label: 'Inducción', icon: ClipboardList },
  { label: 'Seguridad', icon: ShieldCheck },
  { label: 'Documentos', icon: FileText },
  { label: 'Certificados', icon: Award },
]

export function PhoneMock() {
  return (
    <Box
      w={{ md: '210px', lg: '230px' }}
      bg="white"
      borderRadius="2xl"
      overflow="hidden"
      position="relative"
      zIndex={3}
      borderWidth="1px"
      borderColor="blackAlpha.100"
    >
      <Box px={3.5} pt={4} pb={2}>
        <Flex align="center" justify="space-between" mb={3}>
          <HStack spacing={2.5}>
            <Box
              w="36px"
              h="36px"
              borderRadius="full"
              bg="brand.primary"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Text fontSize="sm" fontWeight="bold" color="white">
                C
              </Text>
            </Box>
            <Box>
              <Text fontSize="11px" color="blackAlpha.600" lineHeight="1.1">
                ¡Buen día!
              </Text>
              <Text fontSize="sm" fontWeight="bold" color="brand.ink" lineHeight="1.2">
                Fabiana M.
              </Text>
            </Box>
          </HStack>
          <HStack spacing={2}>
            <Icon as={Search} boxSize={3.5} color="blackAlpha.400" />
            <Icon as={Bell} boxSize={3.5} color="blackAlpha.600" />
          </HStack>
        </Flex>

        <Box bg="brand.soft" borderRadius="lg" px={3} py={2.5} mb={3}>
          <Flex justify="space-between" align="center" mb={1}>
            <Text fontSize="11px" fontWeight="semibold" color="brand.ink">
              Tu inducción
            </Text>
            <Text fontSize="11px" fontWeight="bold" color="brand.primary">
              62%
            </Text>
          </Flex>
          <Progress
            value={62}
            size="sm"
            borderRadius="full"
            bg="blackAlpha.100"
            sx={{ '& > div': { bg: 'brand.accent' } }}
          />
        </Box>

        <VStack align="stretch" spacing={2}>
          {iconTile.map((item) => (
            <HStack
              key={item.label}
              bg="white"
              borderRadius="lg"
              px={2.5}
              py={2.5}
              spacing={3}
              boxShadow="0 1px 3px rgba(0,0,0,0.06)"
              borderWidth="1px"
              borderColor="blackAlpha.50"
            >
              <Flex
                w="32px"
                h="32px"
                borderRadius="md"
                bg="brand.wash"
                align="center"
                justify="center"
                flexShrink={0}
              >
                <Icon as={item.icon} boxSize={4} color="brand.primary" />
              </Flex>
              <Text flex="1" fontSize="xs" fontWeight="semibold" color="brand.ink">
                {item.label}
              </Text>
              <Icon as={CheckCircle2} boxSize={4} color="brand.accent" />
            </HStack>
          ))}
        </VStack>
      </Box>
      <Box h="10px" />
    </Box>
  )
}

const PL = 10

export function DesktopMock() {
  return (
    <Box
      w="full"
      bg="white"
      borderRadius="xl"
      overflow="hidden"
      position="relative"
      zIndex={1}
      borderWidth="1px"
      borderColor="blackAlpha.100"
    >
      <Flex
        align="center"
        gap={1.5}
        pl={PL}
        pr={3}
        py={2}
        bg="brand.soft"
        borderBottomWidth="1px"
        borderColor="blackAlpha.100"
      >
        <Text fontSize="11px" color="blackAlpha.400" noOfLines={1}>
          panel.inductachile.cl
        </Text>
      </Flex>

      <HStack
        spacing={0}
        borderBottomWidth="1px"
        borderColor="blackAlpha.100"
        pl={PL}
        pr={4}
        bg="white"
      >
        {['Programas', 'Avance', 'Evidencia'].map((tab, i) => (
          <Text
            key={tab}
            fontSize="xs"
            fontWeight={i === 1 ? 'bold' : 'medium'}
            color={i === 1 ? 'brand.primary' : 'blackAlpha.500'}
            px={3}
            py={2.5}
            borderBottomWidth="2px"
            borderColor={i === 1 ? 'brand.primary' : 'transparent'}
            mb="-1px"
          >
            {tab}
          </Text>
        ))}
      </HStack>

      <Grid templateColumns="1.15fr 0.95fr" gap={3} pl={PL} pr={3.5} py={3.5}>
        <Box>
          <Text fontSize="11px" color="blackAlpha.600" mb={2} fontWeight="medium">
            Completados este mes
          </Text>
          {[
            { name: 'Inducción general', meta: '148 / 160', pct: 92 },
            { name: 'Seguridad laboral', meta: '125 / 160', pct: 78 },
            { name: 'Onboarding área', meta: '86 / 160', pct: 54 },
          ].map((row) => (
            <Box key={row.name} mb={2} p={2} borderRadius="md" bg="brand.soft" _last={{ mb: 0 }}>
              <Flex justify="space-between" mb={0.5}>
                <Text fontSize="11px" color="brand.ink" fontWeight="semibold">
                  {row.name}
                </Text>
                <Text fontSize="11px" color="brand.primary" fontWeight="bold">
                  {row.pct}%
                </Text>
              </Flex>
              <Text fontSize="10px" color="blackAlpha.600" mb={1}>
                {row.meta} colaboradores
              </Text>
              <Progress
                value={row.pct}
                size="sm"
                borderRadius="full"
                bg="blackAlpha.100"
                sx={{ '& > div': { bg: 'brand.primary' } }}
              />
            </Box>
          ))}
        </Box>

        <VStack align="stretch" spacing={2.5}>
          <Flex bg="brand.soft" borderRadius="lg" p={3} align="center" gap={3}>
            <Box
              w="56px"
              h="56px"
              borderRadius="full"
              flexShrink={0}
              bg="conic-gradient(#4260E6 0 86%, #DDE1F7 86% 100%)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Flex
                w="40px"
                h="40px"
                borderRadius="full"
                bg="white"
                align="center"
                justify="center"
                direction="column"
              >
                <Text fontSize="xs" fontWeight="bold" color="brand.primary" lineHeight="1">
                  86%
                </Text>
              </Flex>
            </Box>
            <Box>
              <Text fontSize="11px" color="blackAlpha.600">
                Cumplimiento
              </Text>
              <Text fontSize="sm" fontWeight="bold" color="brand.ink" lineHeight="1.2">
                Equipo al día
              </Text>
              <Text fontSize="10px" color="blackAlpha.600">
                124 colaboradores
              </Text>
            </Box>
          </Flex>
        </VStack>
      </Grid>
    </Box>
  )
}

/** Clona el panel actual (shell + inicio) con datos inventados para el hero. */
export function DashboardPanelMock() {
  // ponytail: empresa ficticia solo para el hero; no toca Clerk/API
  const empresa = 'Constructora Sur'
  const navPrimary = [
    { label: 'Inicio', icon: Home, active: true },
    { label: 'Equipo', icon: Users, active: false },
  ]
  const navSettings = [{ label: 'Configuración', icon: Settings2, active: false }]
  const cards = [
    {
      icon: Users,
      titulo: 'Gestione el equipo',
      bajada: 'Invite colaboradores y defina quién administra la empresa.',
      cta: 'Ir a Equipo',
      primary: true,
    },
    {
      icon: Settings2,
      titulo: 'Plan y configuración',
      bajada: 'Revise el vencimiento del plan y actualice los datos de contacto.',
      cta: 'Abrir configuración',
      primary: false,
    },
    {
      icon: ClipboardList,
      titulo: 'Programas',
      bajada: 'Inducciones y capacitaciones para su organización.',
      cta: 'Ver inicio',
      primary: false,
    },
  ]

  return (
    <Box
      w="full"
      maxW="72rem"
      mx="auto"
      bg="white"
      borderRadius="xl"
      borderBottomRadius="0"
      overflow="hidden"
      borderWidth="1px"
      borderBottomWidth="0"
      borderColor="brand.accent"
      borderTopWidth="3px"
      borderTopColor="brand.primary"
      boxShadow="0 0 0 1px rgba(27, 34, 167, 0.08)"
    >
      {/* Topbar */}
      <Flex
        h="44px"
        align="center"
        justify="space-between"
        px={4}
        borderBottomWidth="1px"
        borderColor="blackAlpha.100"
        bg="white"
      >
        <Image src="/logo-azul-oscuro.png" alt="Inducta Chile" h="22px" w="auto" />
        <Flex align="center" gap={2}>
          <Text fontSize="xs" color="blackAlpha.600" fontWeight="medium" display={{ base: 'none', md: 'block' }}>
            Soporte
          </Text>
          <Flex
            align="center"
            gap={1.5}
            h="28px"
            px={2}
            borderRadius="md"
            borderWidth="1px"
            borderColor="blackAlpha.100"
            bg="blackAlpha.50"
            display={{ base: 'none', sm: 'flex' }}
          >
            <Box w="14px" h="14px" borderRadius="sm" bg="brand.primary" flexShrink={0} />
            <Text fontSize="10px" fontWeight="medium" color="brand.ink" noOfLines={1} maxW="72px">
              {empresa}
            </Text>
          </Flex>
          <Flex
            w="28px"
            h="28px"
            borderRadius="full"
            bg="brand.primary"
            align="center"
            justify="center"
            flexShrink={0}
          >
            <Text fontSize="10px" fontWeight="bold" color="white">
              CR
            </Text>
          </Flex>
        </Flex>
      </Flex>

      <Flex minH={{ base: '320px', md: '420px', lg: '480px' }}>
        {/* Sidebar */}
        <Flex
          display={{ base: 'none', sm: 'flex' }}
          w={{ sm: '180px', md: '212px' }}
          direction="column"
          justify="space-between"
          flexShrink={0}
          borderRightWidth="1px"
          borderColor="blackAlpha.100"
          px={3}
          py={3.5}
          bg="white"
        >
          <Box>
            <Flex
              align="center"
              h="32px"
              px={2.5}
              mb={2}
              borderRadius="md"
              borderWidth="1px"
              borderColor="blackAlpha.200"
              bg="blackAlpha.50"
              gap={2}
            >
              <Icon as={Search} boxSize={3.5} color="blackAlpha.400" />
              <Text fontSize="xs" color="blackAlpha.500" flex="1" noOfLines={1}>
                Búsqueda rápida
              </Text>
              <Kbd fontSize="8px" bg="white" borderColor="blackAlpha.200" display={{ base: 'none', md: 'inline-flex' }}>
                Ctrl K
              </Kbd>
            </Flex>

            <Flex
              align="center"
              gap={2}
              h="32px"
              px={2.5}
              mb={3}
              borderRadius="md"
              borderWidth="1px"
              borderColor="blackAlpha.200"
              bg="white"
            >
              <Icon as={UserPlus} boxSize={3.5} color="brand.ink" strokeWidth={1.75} />
              <Text fontSize="xs" fontWeight="medium" color="brand.ink" noOfLines={1}>
                Invitar colaborador
              </Text>
            </Flex>

            <VStack as="nav" align="stretch" spacing={0.5}>
              {navPrimary.map((item) => (
                <Flex
                  key={item.label}
                  align="center"
                  gap={2}
                  h="32px"
                  px={2.5}
                  borderRadius="md"
                  bg={item.active ? 'blackAlpha.100' : 'transparent'}
                  color="brand.ink"
                  fontWeight={item.active ? 'semibold' : 'medium'}
                >
                  <Icon as={item.icon} boxSize={3.5} strokeWidth={1.75} />
                  <Text fontSize="xs">{item.label}</Text>
                </Flex>
              ))}
              <Box h="1px" bg="blackAlpha.100" my={2} />
              {navSettings.map((item) => (
                <Flex
                  key={item.label}
                  align="center"
                  gap={2}
                  h="32px"
                  px={2.5}
                  borderRadius="md"
                  color="blackAlpha.700"
                  fontWeight="medium"
                >
                  <Icon as={item.icon} boxSize={3.5} strokeWidth={1.75} />
                  <Text fontSize="xs">{item.label}</Text>
                </Flex>
              ))}
            </VStack>
          </Box>

          <Box
            borderRadius="lg"
            p={3}
            bg="brand.wash"
            borderWidth="1px"
            borderColor="blackAlpha.100"
          >
            <Text fontSize="10px" color="blackAlpha.600" mb={0.5}>
              Plan actual
            </Text>
            <Text fontSize="xs" fontWeight="semibold" color="brand.ink" mb={2}>
              Empresa Plus
            </Text>
            <Flex
              align="center"
              justify="center"
              h="28px"
              borderRadius="md"
              borderWidth="1px"
              borderColor="blackAlpha.200"
              bg="white"
            >
              <Text fontSize="10px" fontWeight="semibold" color="brand.ink">
                Gestionar plan
              </Text>
            </Flex>
          </Box>
        </Flex>

        {/* Main = inicio del panel */}
        <Box flex="1" px={{ base: 5, md: 8 }} pt={{ base: 6, md: 8 }} pb={4} minW={0} overflow="hidden">
          <VStack spacing={0} textAlign="center" mb={6}>
            <Flex
              align="center"
              gap={1.5}
              h="28px"
              px={3}
              mb={4}
              borderRadius="full"
              borderWidth="1px"
              borderColor="blackAlpha.200"
              bg="white"
            >
              <Icon as={Sparkles} boxSize={3} color="brand.primary" />
              <Text fontSize="10px" fontWeight="medium" color="blackAlpha.700">
                {empresa}
              </Text>
              <Icon as={ChevronRight} boxSize={3} color="blackAlpha.500" />
            </Flex>

            <Text
              as="h2"
              fontSize={{ base: '1.35rem', md: '1.85rem' }}
              fontWeight="semibold"
              letterSpacing="-0.04em"
              lineHeight="1.15"
              color="brand.ink"
              mb={5}
            >
              ¿Qué necesita hoy, Camila?
            </Text>

            <Flex
              align="center"
              w="full"
              maxW="22rem"
              h="40px"
              px={3}
              borderRadius="full"
              borderWidth="1px"
              borderColor="blackAlpha.200"
              bg="white"
              gap={2}
            >
              <Icon as={Search} boxSize={3.5} color="blackAlpha.400" flexShrink={0} />
              <Text fontSize="xs" color="blackAlpha.400" flex="1" textAlign="left" noOfLines={1}>
                Buscar equipo, persona o sección…
              </Text>
              <Kbd fontSize="8px" bg="blackAlpha.50" borderColor="blackAlpha.200" display={{ base: 'none', md: 'inline-flex' }}>
                Ctrl K
              </Kbd>
            </Flex>
          </VStack>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={3}>
            {cards.map((c) => (
              <Box
                key={c.titulo}
                borderWidth="1px"
                borderColor="blackAlpha.100"
                borderRadius="xl"
                bg="white"
                overflow="hidden"
                display={{ base: c.primary ? 'flex' : 'none', md: 'flex' }}
                flexDirection="column"
                minH={{ md: '200px' }}
              >
                <Flex
                  h="72px"
                  align="center"
                  justify="center"
                  borderBottomWidth="1px"
                  borderColor="blackAlpha.100"
                >
                  <Flex
                    w="40px"
                    h="40px"
                    align="center"
                    justify="center"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="blackAlpha.200"
                    bg="white"
                  >
                    <Icon as={c.icon} boxSize={4} color="brand.ink" strokeWidth={1.5} />
                  </Flex>
                </Flex>
                <Box p={3.5} flex="1" display="flex" flexDirection="column">
                  <Text fontSize="sm" fontWeight="semibold" color="brand.ink" mb={1} letterSpacing="-0.02em">
                    {c.titulo}
                  </Text>
                  <Text fontSize="xs" color="blackAlpha.600" lineHeight="1.45" flex="1" mb={3} noOfLines={3}>
                    {c.bajada}
                  </Text>
                  <Flex
                    align="center"
                    justify="center"
                    h="32px"
                    borderRadius="md"
                    bg={c.primary ? 'brand.primary' : 'white'}
                    color={c.primary ? 'white' : 'brand.ink'}
                    borderWidth={c.primary ? 0 : '1px'}
                    borderColor="blackAlpha.200"
                  >
                    <Text fontSize="xs" fontWeight="semibold">
                      {c.cta}
                    </Text>
                  </Flex>
                </Box>
              </Box>
            ))}
          </Grid>
        </Box>
      </Flex>
    </Box>
  )
}
