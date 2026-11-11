import {
  Badge,
  Box,
  Button,
  Collapse,
  Flex,
  Icon,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Text,
  VStack,
} from '@chakra-ui/react'
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  FileText,
  Play,
  Video,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  idsItemsModulos,
  marcarItemModuloCompletado,
  modulosCompletos,
  nivelCompleto,
  normalizarModulos,
  progresoModulosPct,
  youtubeEmbedId,
} from '../../features/programas/programasService'
import { useSupabase } from '../../hooks/useSupabase'

function flatItems(modulos) {
  const out = []
  ;(modulos || []).forEach((n, ni) => {
    ;(n.lecciones || []).forEach((l, li) => {
      ;(l.items || []).forEach((it, ii) => {
        out.push({
          ...it,
          _nivelIdx: ni,
          _lecIdx: li,
          _itemIdx: ii,
          _nivelTitulo: n.titulo,
          _lecTitulo: l.titulo,
        })
      })
    })
  })
  return out
}

export default function EstudioModulosModal({
  isOpen,
  onClose,
  test,
  idEmpresa,
  user,
  avance,
  onProgreso,
  onListoParaRendir,
}) {
  const supabase = useSupabase()
  const modulos = useMemo(() => normalizarModulos(test?.modulos), [test?.modulos])
  const [nivelIdx, setNivelIdx] = useState(0)
  const [lecIdx, setLecIdx] = useState(0)
  const [itemIdx, setItemIdx] = useState(0)
  const [nivelesAbiertos, setNivelesAbiertos] = useState(() => new Set([0]))
  const [leccionesAbiertas, setLeccionesAbiertas] = useState(() => new Set(['0:0']))
  const [progreso, setProgreso] = useState(avance?.progreso_modulos || { completados: [] })
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setProgreso(avance?.progreso_modulos || { completados: [] })
    setNivelIdx(0)
    setLecIdx(0)
    setItemIdx(0)
    setNivelesAbiertos(new Set([0]))
    setLeccionesAbiertas(new Set(['0:0']))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, test?.id_test])

  const nivel = modulos[nivelIdx] || null
  const leccion = nivel?.lecciones?.[lecIdx] || null
  const item = leccion?.items?.[itemIdx] || null
  const completados = useMemo(() => new Set((progreso?.completados || []).map(String)), [progreso])
  const pct = progresoModulosPct(modulos, progreso)
  const listo = modulosCompletos(modulos, progreso)
  const totalItems = idsItemsModulos(modulos).length
  const listaPlana = useMemo(() => flatItems(modulos), [modulos])
  const planoIdx = listaPlana.findIndex(
    (it) => it._nivelIdx === nivelIdx && it._lecIdx === lecIdx && it._itemIdx === itemIdx,
  )

  const nivelDesbloqueado = (i) => {
    if (i <= 0) return true
    return nivelCompleto(modulos[i - 1], progreso)
  }

  const seleccionar = (ni, li, ii) => {
    if (!nivelDesbloqueado(ni)) return
    setNivelIdx(ni)
    setLecIdx(li)
    setItemIdx(ii)
    setNivelesAbiertos((prev) => new Set([...prev, ni]))
    setLeccionesAbiertas((prev) => new Set([...prev, `${ni}:${li}`]))
  }

  const toggleNivel = (i) => {
    if (!nivelDesbloqueado(i)) return
    setNivelesAbiertos((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const toggleLeccion = (ni, li) => {
    const key = `${ni}:${li}`
    setLeccionesAbiertas((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const marcarVisto = async () => {
    if (!item?.id || !idEmpresa || !user?.id || !test?.id_test) return
    if (completados.has(String(item.id))) return true
    setGuardando(true)
    try {
      const res = await marcarItemModuloCompletado(supabase, {
        id_test: test.id_test,
        id_empresa: idEmpresa,
        id_usuario: user.id,
        itemId: item.id,
        test_titulo: test.titulo,
        nombre_usuario: user.fullName || user.firstName || 'Colaborador',
        progresoActual: progreso,
      })
      setProgreso(res.progreso_modulos)
      onProgreso?.(res.avance)
      return true
    } finally {
      setGuardando(false)
    }
  }

  const irA = async (delta) => {
    if (delta > 0) await marcarVisto()
    const next = planoIdx + delta
    if (next < 0 || next >= listaPlana.length) return
    const target = listaPlana[next]
    if (!nivelDesbloqueado(target._nivelIdx)) return
    seleccionar(target._nivelIdx, target._lecIdx, target._itemIdx)
  }

  if (!test) return null

  const ytId = item?.tipo === 'youtube' ? youtubeEmbedId(item.url) : null
  const vistoActual = item ? completados.has(String(item.id)) : false
  const tipoLabel =
    item?.tipo === 'youtube' ? `Video ${(itemIdx || 0) + 1}` : `Lectura ${(itemIdx || 0) + 1}`

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside" isCentered>
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent borderRadius="xl" overflow="hidden" maxH="94vh">
        <ModalHeader borderBottomWidth="1px" borderColor="blackAlpha.100" py={3} px={5} bg="white">
          <Flex align="center" gap={3} pr={8}>
            <Flex
              align="center"
              justify="center"
              boxSize="42px"
              borderRadius="full"
              bg="brand.wash"
              color="brand.primary"
              flexShrink={0}
            >
              <Icon as={BookOpen} boxSize={5} />
            </Flex>
            <Box minW={0} flex="1">
              <Text fontSize="xs" color="brand.primary" fontWeight="semibold">
                Capacitación
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="brand.ink" letterSpacing="-0.02em" noOfLines={1}>
                {test.titulo}
              </Text>
              <Progress
                value={pct}
                size="xs"
                mt={2}
                borderRadius="full"
                bg="blackAlpha.100"
                sx={{ '& > div': { bg: 'brand.primary' } }}
              />
              <Text fontSize="2xs" color="blackAlpha.500" mt={1}>
                {completados.size}/{totalItems} · {pct}%
              </Text>
            </Box>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={0}>
          <Flex direction={{ base: 'column', md: 'row' }} minH={{ md: '460px' }}>
            {/* Sidebar Nivel → Lección → ítems */}
            <Box
              w={{ base: 'full', md: '280px' }}
              borderRightWidth={{ md: '1px' }}
              borderBottomWidth={{ base: '1px', md: 0 }}
              borderColor="blackAlpha.100"
              bg="brand.primary"
              color="white"
              maxH={{ base: '240px', md: 'none' }}
              overflowY="auto"
              display="flex"
              flexDirection="column"
            >
              <VStack align="stretch" spacing={0} py={1} flex="1">
                {modulos.map((n, ni) => {
                  const abierto = nivelesAbiertos.has(ni)
                  const done = nivelCompleto(n, progreso)
                  const locked = !nivelDesbloqueado(ni)
                  return (
                    <Box key={n.id || ni}>
                      <Button
                        w="full"
                        h="auto"
                        py={3}
                        px={4}
                        borderRadius={0}
                        justifyContent="space-between"
                        bg={ni === nivelIdx ? 'blackAlpha.300' : 'transparent'}
                        color="white"
                        fontWeight="semibold"
                        fontSize="sm"
                        opacity={locked ? 0.45 : 1}
                        cursor={locked ? 'not-allowed' : 'pointer'}
                        _hover={{ bg: locked ? 'transparent' : 'blackAlpha.200' }}
                        rightIcon={abierto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        onClick={() => toggleNivel(ni)}
                      >
                        <Flex align="center" gap={2} minW={0}>
                          {done ? <Check size={14} /> : null}
                          <Text as="span" noOfLines={1}>
                            {n.titulo || `Nivel ${ni + 1}`}
                          </Text>
                        </Flex>
                      </Button>

                      <Collapse in={abierto && !locked} animateOpacity>
                        <Box bg="blackAlpha.200" pb={1}>
                          {(n.lecciones || []).map((l, li) => {
                            const lecKey = `${ni}:${li}`
                            const lecAbierta = leccionesAbiertas.has(lecKey)
                            return (
                              <Box key={l.id || lecKey}>
                                <Button
                                  w="full"
                                  h="auto"
                                  py={2.5}
                                  px={4}
                                  pl={6}
                                  borderRadius={0}
                                  justifyContent="space-between"
                                  bg={
                                    ni === nivelIdx && li === lecIdx
                                      ? 'blackAlpha.300'
                                      : 'transparent'
                                  }
                                  color="white"
                                  fontSize="xs"
                                  fontWeight="semibold"
                                  _hover={{ bg: 'blackAlpha.250' }}
                                  rightIcon={
                                    lecAbierta ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                  }
                                  onClick={() => toggleLeccion(ni, li)}
                                >
                                  <Text as="span" noOfLines={1} textAlign="left">
                                    {l.titulo || `Lección ${li + 1}`}
                                  </Text>
                                </Button>
                                <Collapse in={lecAbierta} animateOpacity>
                                  <Box pl={5} pr={2} pb={2} position="relative">
                                    <Box
                                      position="absolute"
                                      left="28px"
                                      top={1}
                                      bottom={2}
                                      w="1px"
                                      bg="whiteAlpha.350"
                                    />
                                    <VStack align="stretch" spacing={0.5}>
                                      {(l.items || []).map((it, ii) => {
                                        const activo =
                                          ni === nivelIdx && li === lecIdx && ii === itemIdx
                                        const visto = completados.has(String(it.id))
                                        return (
                                          <Button
                                            key={it.id || ii}
                                            size="sm"
                                            h="auto"
                                            py={2}
                                            pl={7}
                                            justifyContent="flex-start"
                                            variant="ghost"
                                            color="white"
                                            bg={activo ? 'whiteAlpha.250' : 'transparent'}
                                            _hover={{ bg: 'whiteAlpha.200' }}
                                            onClick={() => seleccionar(ni, li, ii)}
                                          >
                                            <Flex align="flex-start" gap={2} minW={0}>
                                              <Box
                                                mt="2px"
                                                color={visto ? 'green.200' : 'whiteAlpha.700'}
                                              >
                                                {visto ? (
                                                  <Check size={13} />
                                                ) : it.tipo === 'youtube' ? (
                                                  <Video size={13} />
                                                ) : (
                                                  <FileText size={13} />
                                                )}
                                              </Box>
                                              <Box minW={0} textAlign="left">
                                                <Text
                                                  fontSize="2xs"
                                                  color="whiteAlpha.650"
                                                  lineHeight="1.1"
                                                >
                                                  {it.tipo === 'youtube' ? 'Video' : 'Lectura'}{' '}
                                                  {ii + 1}
                                                </Text>
                                                <Text fontSize="xs" noOfLines={2} lineHeight="1.25">
                                                  {it.titulo ||
                                                    (it.tipo === 'youtube'
                                                      ? 'Video de estudio'
                                                      : 'Contenido')}
                                                </Text>
                                              </Box>
                                            </Flex>
                                          </Button>
                                        )
                                      })}
                                    </VStack>
                                  </Box>
                                </Collapse>
                              </Box>
                            )
                          })}
                        </Box>
                      </Collapse>
                    </Box>
                  )
                })}
              </VStack>

              <Button
                mt="auto"
                w="full"
                h="48px"
                borderRadius={0}
                bg="brand.primaryDark"
                color="white"
                fontWeight="semibold"
                rightIcon={<ChevronRight size={16} />}
                isDisabled={!listo}
                _hover={{ bg: 'brand.ink' }}
                onClick={() => listo && onListoParaRendir?.(test, progreso)}
              >
                Plan de capacitación
              </Button>
            </Box>

            {/* Contenido */}
            <Box flex="1" bg="white" position="relative">
              <Flex
                position="absolute"
                insetY={0}
                left={2}
                align="center"
                zIndex={2}
                display={{ base: 'none', md: 'flex' }}
              >
                <IconButton
                  aria-label="Anterior"
                  icon={<ChevronLeft size={20} />}
                  isRound
                  size="sm"
                  bg="white"
                  borderWidth="1px"
                  borderColor="blackAlpha.200"
                  isDisabled={planoIdx <= 0}
                  onClick={() => irA(-1)}
                />
              </Flex>
              <Flex
                position="absolute"
                insetY={0}
                right={2}
                align="center"
                zIndex={2}
                display={{ base: 'none', md: 'flex' }}
              >
                <IconButton
                  aria-label="Siguiente"
                  icon={<ChevronRight size={20} />}
                  isRound
                  size="sm"
                  bg="white"
                  borderWidth="1px"
                  borderColor="blackAlpha.200"
                  isDisabled={planoIdx < 0 || planoIdx >= listaPlana.length - 1}
                  isLoading={guardando}
                  onClick={() => irA(1)}
                />
              </Flex>

              <Box p={{ base: 4, md: 6 }} maxW="52rem" mx="auto">
                {!item ? (
                  <Text fontSize="sm" color="blackAlpha.600">
                    Seleccione un contenido en el menú.
                  </Text>
                ) : (
                  <VStack align="stretch" spacing={4}>
                    {item.tipo === 'youtube' ? (
                      ytId ? (
                        <Box
                          borderRadius="lg"
                          overflow="hidden"
                          bg="black"
                          borderWidth="1px"
                          borderColor="blackAlpha.100"
                        >
                          <Box
                            as="iframe"
                            title={item.titulo || 'YouTube'}
                            src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                            sandbox="allow-scripts allow-same-origin allow-presentation"
                            w="full"
                            h={{ base: '220px', md: '360px' }}
                            border="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </Box>
                      ) : (
                        <Text fontSize="sm" color="orange.600">
                          Enlace de YouTube no válido.
                        </Text>
                      )
                    ) : null}

                    <Box>
                      <Text fontSize="xs" color="blackAlpha.500">
                        {nivel?.titulo || `Nivel ${nivelIdx + 1}`} /{' '}
                        {leccion?.titulo || `Lección ${lecIdx + 1}`} / {tipoLabel}
                      </Text>
                      <Text
                        mt={1}
                        fontSize={{ base: 'xl', md: '2xl' }}
                        fontWeight="bold"
                        color="brand.primary"
                        letterSpacing="-0.02em"
                      >
                        {item.titulo || (item.tipo === 'youtube' ? 'Video de estudio' : 'Lectura')}
                      </Text>
                      <Flex gap={2} mt={2}>
                        <Badge>{item.tipo === 'youtube' ? 'Video' : 'Texto'}</Badge>
                        {vistoActual ? <Badge colorScheme="green">Completado</Badge> : null}
                      </Flex>
                      {item.tipo === 'youtube' && item.descripcion ? (
                        <Text mt={3} fontSize="sm" color="blackAlpha.700" lineHeight="1.6">
                          {item.descripcion}
                        </Text>
                      ) : null}
                      {item.tipo === 'texto' ? (
                        <Box
                          mt={4}
                          p={4}
                          borderWidth="1px"
                          borderColor="blackAlpha.100"
                          borderRadius="lg"
                          bg="brand.soft"
                        >
                          <Text
                            fontSize="sm"
                            color="blackAlpha.800"
                            whiteSpace="pre-wrap"
                            lineHeight="1.7"
                          >
                            {item.cuerpo}
                          </Text>
                        </Box>
                      ) : null}
                    </Box>
                  </VStack>
                )}
              </Box>
            </Box>
          </Flex>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor="blackAlpha.100" gap={2} flexWrap="wrap">
          <Button size="sm" variant="outline" onClick={onClose} leftIcon={<ClipboardList size={14} />}>
            Salir
          </Button>
          <Flex gap={2} ml="auto">
            {!listo ? (
              <Button
                size="sm"
                isLoading={guardando}
                onClick={() => irA(1)}
                rightIcon={<ChevronRight size={16} />}
              >
                {vistoActual ? 'Siguiente' : 'Completar y seguir'}
              </Button>
            ) : (
              <Button
                size="sm"
                leftIcon={<Play size={14} fill="currentColor" />}
                isDisabled={!listo}
                onClick={() => listo && onListoParaRendir?.(test, progreso)}
              >
                Rendir evaluación
              </Button>
            )}
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
