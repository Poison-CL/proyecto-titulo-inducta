import {
  Box,
  Button,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react'
import { Printer } from 'lucide-react'
import { brandingCertificado, fechaCortaEs, getPlan } from '../../lib/planes'

const LOGO_INDUCTA = '/logo-azul-oscuro.png'

export default function CertificadoModal({
  isOpen,
  onClose,
  avance,
  empresa,
  plan,
  logoEmpresaUrl,
}) {
  if (!avance) return null

  const planResuelto = plan || getPlan(empresa?.plan) || getPlan('demo')
  const brand = brandingCertificado(planResuelto)
  const esMarcaInducta = brand.modo === 'marca_inducta'

  const nombreTrabajador = avance.nombre_usuario || 'Colaborador'
  const nombreEmpresa = empresa?.nombre_comercial || 'Empresa'
  const nombrePrograma = avance.test_titulo || 'Inducción corporativa'
  const fechaTexto = avance.fecha_evaluacion ? fechaCortaEs(avance.fecha_evaluacion) : '—'
  const puntaje = Number.isFinite(Number(avance.puntaje)) ? Number(avance.puntaje) : null
  const puntajeMinimo = avance.porcentaje_minimo ?? 70
  const logoEmpresa = logoEmpresaUrl || empresa?.logo_url || null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(2px)" />
      <ModalContent borderRadius="xl" overflow="hidden">
        <ModalHeader
          borderBottomWidth="1px"
          borderColor="blackAlpha.100"
          py={3.5}
          px={5}
          fontSize="sm"
          fontWeight="semibold"
          letterSpacing="-0.02em"
          color="brand.ink"
        >
          Constancia
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={{ base: 4, md: 6 }} bg="brand.soft">
          <Box
            id="certificado-print-area"
            bg="white"
            borderWidth="1px"
            borderColor="blackAlpha.200"
            px={{ base: 5, md: 10 }}
            py={{ base: 7, md: 10 }}
            position="relative"
          >
            <Box
              position="absolute"
              inset="10px"
              borderWidth="1px"
              borderColor="blackAlpha.150"
              pointerEvents="none"
              aria-hidden
            />

            {/* Encabezado: logos según plan */}
            <Flex justify="space-between" align="flex-start" mb={8} position="relative" gap={4}>
              {esMarcaInducta ? (
                <Flex align="center" gap={3} minW={0}>
                  <Image
                    src={LOGO_INDUCTA}
                    alt="Inducta Chile"
                    h={{ base: '36px', md: '44px' }}
                    w="auto"
                    objectFit="contain"
                  />
                  <Box minW={0}>
                    <Text
                      fontSize="2xs"
                      color="blackAlpha.500"
                      letterSpacing="0.04em"
                      textTransform="uppercase"
                    >
                      Acreditación de inducción laboral
                    </Text>
                    <Text fontSize="xs" color="blackAlpha.600" mt={0.5} noOfLines={1}>
                      {nombreEmpresa}
                    </Text>
                  </Box>
                </Flex>
              ) : (
                <Flex align="center" gap={3} minW={0}>
                  {logoEmpresa ? (
                    <Image
                      src={logoEmpresa}
                      alt={nombreEmpresa}
                      h={{ base: '40px', md: '48px' }}
                      w="auto"
                      maxW="160px"
                      objectFit="contain"
                      borderRadius="md"
                    />
                  ) : (
                    <Box>
                      <Text
                        fontSize={{ base: 'md', md: 'lg' }}
                        fontWeight="semibold"
                        letterSpacing="-0.02em"
                        color="brand.ink"
                        noOfLines={2}
                      >
                        {nombreEmpresa}
                      </Text>
                      <Text
                        fontSize="2xs"
                        color="blackAlpha.500"
                        letterSpacing="0.04em"
                        textTransform="uppercase"
                        mt={0.5}
                      >
                        Acreditación de inducción laboral
                      </Text>
                    </Box>
                  )}
                  {logoEmpresa ? (
                    <Box minW={0}>
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        letterSpacing="-0.02em"
                        color="brand.ink"
                        noOfLines={2}
                      >
                        {nombreEmpresa}
                      </Text>
                      <Text
                        fontSize="2xs"
                        color="blackAlpha.500"
                        letterSpacing="0.04em"
                        textTransform="uppercase"
                      >
                        Acreditación de inducción laboral
                      </Text>
                    </Box>
                  ) : null}
                </Flex>
              )}

              <Box textAlign="right" flexShrink={0}>
                {!esMarcaInducta ? (
                  <Image
                    src={LOGO_INDUCTA}
                    alt="Inducta Chile"
                    h="22px"
                    w="auto"
                    objectFit="contain"
                    ml="auto"
                    mb={2}
                    opacity={0.9}
                  />
                ) : null}
                <Text fontSize="2xs" color="blackAlpha.500" lineHeight="1.4">
                  Registro digital
                  <br />
                  {fechaTexto}
                </Text>
                <Text
                  mt={1.5}
                  fontSize="2xs"
                  fontWeight="semibold"
                  color="brand.primary"
                  letterSpacing="0.04em"
                  textTransform="uppercase"
                >
                  {brand.planNombre}
                </Text>
              </Box>
            </Flex>

            <Box textAlign="center" mb={8} position="relative">
              <Text
                fontSize="11px"
                fontWeight="semibold"
                letterSpacing="0.18em"
                textTransform="uppercase"
                color="blackAlpha.500"
                mb={5}
              >
                Constancia de aprobación
              </Text>

              <Text fontSize="sm" color="blackAlpha.600" mb={2}>
                Se deja constancia de que
              </Text>
              <Text
                fontSize={{ base: '1.75rem', md: '2.25rem' }}
                fontWeight="semibold"
                letterSpacing="-0.035em"
                lineHeight="1.15"
                color="brand.ink"
                mb={4}
              >
                {nombreTrabajador}
              </Text>
              <Text fontSize="sm" color="blackAlpha.600" maxW="42ch" mx="auto" lineHeight="1.6">
                aprobó la evaluación correspondiente al programa de inducción:
              </Text>
              <Text
                mt={4}
                fontSize={{ base: 'md', md: 'lg' }}
                fontWeight="semibold"
                letterSpacing="-0.02em"
                color="brand.ink"
                maxW="36ch"
                mx="auto"
                lineHeight="1.35"
              >
                {nombrePrograma}
              </Text>
              <Text mt={2} fontSize="sm" color="blackAlpha.500">
                {nombreEmpresa}
              </Text>
            </Box>

            <Flex
              borderTopWidth="1px"
              borderBottomWidth="1px"
              borderColor="blackAlpha.100"
              py={4}
              justify="space-between"
              gap={4}
              flexWrap="wrap"
              position="relative"
            >
              <Dato label="Resultado" valor={puntaje == null ? '—' : `${puntaje}%`} />
              <Dato label="Exigencia" valor={`${puntajeMinimo}%`} />
              <Dato label="Fecha" valor={fechaTexto} />
              <Dato label="Estado" valor="Aprobado" />
            </Flex>

            <Flex justify="space-between" align="flex-end" mt={8} gap={4} position="relative">
              <Flex align="center" gap={2} minW={0}>
                {esMarcaInducta ? (
                  <Image src={LOGO_INDUCTA} alt="" h="16px" w="auto" opacity={0.7} aria-hidden />
                ) : null}
                <Text fontSize="2xs" color="blackAlpha.400" maxW="42ch" lineHeight="1.5">
                  {brand.etiquetaPie}. Para fines de cumplimiento interno y auditoría laboral.
                </Text>
              </Flex>
              <Box textAlign="right" minW="9rem">
                <Box borderBottomWidth="1px" borderColor="blackAlpha.300" mb={1.5} h="1px" />
                <Text fontSize="2xs" color="blackAlpha.500">
                  Registro electrónico
                </Text>
              </Box>
            </Flex>
          </Box>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor="blackAlpha.100" py={3} gap={2}>
          <Button size="sm" h="36px" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button size="sm" h="36px" leftIcon={<Printer size={15} />} onClick={() => window.print()}>
            Imprimir / PDF
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function Dato({ label, valor }) {
  return (
    <Box minW="5.5rem">
      <Text fontSize="2xs" color="blackAlpha.500" textTransform="uppercase" letterSpacing="0.06em" mb={0.5}>
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="semibold" color="brand.ink">
        {valor}
      </Text>
    </Box>
  )
}
