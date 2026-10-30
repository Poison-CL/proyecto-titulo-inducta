import {
  Badge,
  Box,
  Grid,
  HStack,
  Progress,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useOrganization, useUser } from '@clerk/clerk-react'
import { Award, BookOpen, TrendingUp } from 'lucide-react'
import AccionCard from '../../components/dashboard/AccionCard'
import WorkspaceHome from '../../components/dashboard/WorkspaceHome'

export default function EmpleadoDashboardPage() {
  const { user } = useUser()
  const { organization } = useOrganization()
  const nombre = user?.firstName || 'colaborador'

  return (
    <WorkspaceHome
      pillLabel={organization?.name || 'Inducta Chile'}
      pillTo="/empleado"
      titulo={`Hola, ${nombre}.`}
      placeholder="Buscar sección del panel…"
    >
      {/* Resumen de actividad */}
      <Box mb={8}>
        <Text
          fontSize="xs"
          fontWeight="semibold"
          letterSpacing="0.06em"
          color="blackAlpha.500"
          textTransform="uppercase"
          mb={4}
        >
          Tu actividad
        </Text>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={3}>
          <ResumenCard
            label="Programas asignados"
            valor="—"
            color="brand.primary"
          />
          <ResumenCard label="Etapas completadas" valor="—" color="green.500" />
          <ResumenCard
            label="Certificados obtenidos"
            valor="—"
            color="purple.500"
          />
        </Grid>
      </Box>

      {/* Programa activo placeholder */}
      <Box
        mb={8}
        p={5}
        borderWidth="1px"
        borderColor="blackAlpha.100"
        borderRadius="xl"
      >
        <HStack justify="space-between" mb={3}>
          <Text fontWeight="semibold" color="brand.ink" fontSize="sm">
            Inducción activa
          </Text>
          <Badge colorScheme="blue" fontSize="10px" borderRadius="full" px={2}>
            En progreso
          </Badge>
        </HStack>
        <Text color="blackAlpha.600" fontSize="sm" mb={4}>
          Cuando tu empresa te asigne un programa de inducción aparecerá aquí.
        </Text>
        <Progress value={0} size="sm" borderRadius="full" colorScheme="blue" />
        <Text fontSize="xs" color="blackAlpha.500" mt={1.5}>
          0% completado
        </Text>
      </Box>

      {/* Accesos rápidos */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <AccionCard
          icon={BookOpen}
          titulo="Mis programas"
          bajada="Revisa las inducciones y capacitaciones que tu empresa te ha asignado."
          cta="Ver programas"
          to="/empleado/programas"
          primary
        />
        <AccionCard
          icon={TrendingUp}
          titulo="Mi progreso"
          bajada="Consulta el avance por etapa de cada programa de inducción."
          cta="Ver progreso"
          to="/empleado/progreso"
        />
        <AccionCard
          icon={Award}
          titulo="Mis certificados"
          bajada="Descarga los certificados de los programas que hayas completado."
          cta="Ver certificados"
          to="/empleado/certificados"
        />
      </Grid>
    </WorkspaceHome>
  )
}

function ResumenCard({ label, valor, color }) {
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderColor="blackAlpha.100"
      borderRadius="lg"
      bg="white"
    >
      <VStack align="start" spacing={1}>
        <Text fontSize="xs" color="blackAlpha.500">
          {label}
        </Text>
        <Text fontSize="2xl" fontWeight="semibold" color={color}>
          {valor}
        </Text>
      </VStack>
    </Box>
  )
}
