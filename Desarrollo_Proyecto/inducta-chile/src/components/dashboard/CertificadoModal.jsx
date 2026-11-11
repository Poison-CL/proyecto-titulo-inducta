import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Award, Printer, ShieldCheck } from 'lucide-react'
import { fechaCortaEs } from '../../lib/planes'

export default function CertificadoModal({ isOpen, onClose, avance, empresa, plan }) {
  if (!avance) return null

  const esDemo = !plan || plan.id === 'demo'
  const nombreTrabajador = avance.nombre_usuario || 'Colaborador'
  const nombreEmpresa = empresa?.nombre_comercial || 'Empresa'
  const nombrePrograma = avance.test_titulo || 'Inducción Corporativa'
  const fechaTexto = avance.fecha_evaluacion ? fechaCortaEs(avance.fecha_evaluacion) : 'Fecha de aprobación'
  const puntaje = avance.puntaje ?? 100
  const puntajeMinimo = avance.porcentaje_minimo ?? 70

  const handlePrint = () => {
    window.print()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(2px)" />
      <ModalContent borderRadius="2xl" overflow="hidden" boxShadow="2xl">
        <ModalHeader borderBottomWidth="1px" borderColor="blackAlpha.100" py={4} bg="brand.soft">
          <Flex align="center" justify="space-between" pr={6}>
            <Flex align="center" gap={2}>
              <Icon as={Award} color="brand.primary" boxSize={5} />
              <Text fontSize="md" fontWeight="semibold" color="brand.ink">
                Constancia de Inducción Laboral
              </Text>
            </Flex>
            <Badge colorScheme="green" fontSize="xs" px={2.5} py={0.5} borderRadius="full">
              Aprobada
            </Badge>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={{ base: 6, md: 10 }}>
          {/* Contenedor imprimible del Certificado */}
          <Box
            id="certificado-print-area"
            p={{ base: 6, md: 10 }}
            borderWidth="2px"
            borderColor="brand.primary"
            borderRadius="xl"
            bg="white"
            position="relative"
            boxShadow="sm"
          >
            {/* Encabezado con Identidad Visual según plan (HU-17) */}
            <Flex justify="space-between" align="center" mb={8} borderBottomWidth="1px" borderColor="blackAlpha.100" pb={6}>
              <Box>
                {esDemo ? (
                  <Flex align="center" gap={2}>
                    <img src="/assets/logo-oficial.png" alt="Inducta Chile" style={{ height: '36px' }} onError={(e) => { e.target.style.display = 'none' }} />
                    <Text fontWeight="bold" fontSize="lg" color="brand.primary" letterSpacing="-0.02em">
                      Inducta Chile
                    </Text>
                  </Flex>
                ) : (
                  <Box>
                    <Text fontWeight="bold" fontSize="xl" color="brand.ink">
                      {nombreEmpresa}
                    </Text>
                    <Text fontSize="xs" color="blackAlpha.500" letterSpacing="0.05em" textTransform="uppercase">
                      Acreditación de Capacitación Interna
                    </Text>
                  </Box>
                )}
              </Box>

              <Flex align="center" gap={1.5} bg="green.50" px={3} py={1.5} borderRadius="lg" borderWidth="1px" borderColor="green.200">
                <Icon as={ShieldCheck} color="green.600" boxSize={4} />
                <Text fontSize="xs" fontWeight="semibold" color="green.700">
                  Acreditación Válida
                </Text>
              </Flex>
            </Flex>

            {/* Cuerpo del Certificado */}
            <VStack spacing={5} textAlign="center" py={4}>
              <Text fontSize="xs" fontWeight="semibold" letterSpacing="0.15em" textTransform="uppercase" color="brand.primary">
                Certificado de Aprobación
              </Text>

              <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="brand.ink" letterSpacing="-0.03em" lineHeight="1.2">
                {nombreTrabajador}
              </Text>

              <Text fontSize="sm" color="blackAlpha.700" maxW="48ch" lineHeight="tall">
                Ha completado y aprobado satisfactoriamente los contenidos y la evaluación correspondientes al programa de inducción institucional:
              </Text>

              <Box p={4} bg="brand.soft" borderRadius="lg" w="full" borderWidth="1px" borderColor="blackAlpha.100">
                <Text fontWeight="semibold" fontSize="lg" color="brand.primary">
                  {nombrePrograma}
                </Text>
                <Text fontSize="xs" color="blackAlpha.600" mt={1}>
                  Organización: <strong>{nombreEmpresa}</strong>
                </Text>
              </Box>

              {/* Métricas de aprobación */}
              <Flex justify="center" gap={8} pt={2}>
                <Box textAlign="center">
                  <Text fontSize="xs" color="blackAlpha.500">
                    Resultado
                  </Text>
                  <Text fontWeight="bold" color="green.600" fontSize="md">
                    {puntaje}% de aciertos
                  </Text>
                </Box>
                <Divider orientation="vertical" h="36px" />
                <Box textAlign="center">
                  <Text fontSize="xs" color="blackAlpha.500">
                    Exigencia mínima
                  </Text>
                  <Text fontWeight="medium" color="brand.ink" fontSize="md">
                    {puntajeMinimo}%
                  </Text>
                </Box>
                <Divider orientation="vertical" h="36px" />
                <Box textAlign="center">
                  <Text fontSize="xs" color="blackAlpha.500">
                    Fecha de acreditación
                  </Text>
                  <Text fontWeight="medium" color="brand.ink" fontSize="md">
                    {fechaTexto}
                  </Text>
                </Box>
              </Flex>
            </VStack>

            {/* Pie de constancia (HU-17: sin folio y sin firma) */}
            <Flex justify="space-between" align="center" mt={10} pt={4} borderTopWidth="1px" borderColor="blackAlpha.100">
              <Text fontSize="2xs" color="blackAlpha.400">
                Registro digital emitido mediante la plataforma Inducta Chile · Constancia para fines de cumplimiento y auditoría interna.
              </Text>
              {esDemo && (
                <Text fontSize="2xs" color="brand.primary" fontWeight="medium">
                  Plan Demostración
                </Text>
              )}
            </Flex>
          </Box>
        </ModalBody>

        <ModalFooter bg="brand.soft" borderTopWidth="1px" borderColor="blackAlpha.100" py={3}>
          <Flex w="full" justify="space-between" align="center">
            <Text fontSize="xs" color="blackAlpha.500">
              Listo para presentar ante auditorías laborales y fiscalizaciones.
            </Text>
            <Flex gap={2}>
              <Button size="sm" variant="outline" onClick={onClose}>
                Cerrar
              </Button>
              <Button
                size="sm"
                variant="solid"
                bg="brand.primary"
                leftIcon={<Printer size={15} />}
                onClick={handlePrint}
              >
                Imprimir / Guardar PDF
              </Button>
            </Flex>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
