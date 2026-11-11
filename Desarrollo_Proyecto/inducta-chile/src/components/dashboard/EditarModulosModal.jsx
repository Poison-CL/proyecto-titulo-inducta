import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { BookOpen, Check, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  actualizarModulosEvaluacion,
  normalizarModulos,
} from '../../features/programas/programasService'
import { useSupabase } from '../../hooks/useSupabase'

export default function EditarModulosModal({ isOpen, onClose, test, idEmpresa, onGuardado }) {
  const supabase = useSupabase()
  const toast = useToast()
  const [modulos, setModulos] = useState([])
  const [guardando, setGuardando] = useState(false)

  const nuevoId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

  useEffect(() => {
    if (!isOpen) return
    setModulos(normalizarModulos(test?.modulos || []))
  }, [isOpen, test?.id_test, test?.modulos])

  const handleAgregarNivel = () => {
    setModulos((prev) => [
      ...prev,
      {
        id: nuevoId(),
        titulo: `Nivel ${prev.length + 1}`,
        lecciones: [{ id: nuevoId(), titulo: 'Lección 1', items: [] }],
      },
    ])
  }

  const handleEliminarNivel = (nIdx) => setModulos((prev) => prev.filter((_, i) => i !== nIdx))

  const handleTituloNivel = (nIdx, titulo) => {
    setModulos((prev) => prev.map((n, i) => (i === nIdx ? { ...n, titulo } : n)))
  }

  const handleAgregarLeccion = (nIdx) => {
    setModulos((prev) =>
      prev.map((n, i) =>
        i === nIdx
          ? {
              ...n,
              lecciones: [
                ...(n.lecciones || []),
                { id: nuevoId(), titulo: `Lección ${(n.lecciones || []).length + 1}`, items: [] },
              ],
            }
          : n,
      ),
    )
  }

  const handleEliminarLeccion = (nIdx, lIdx) => {
    setModulos((prev) =>
      prev.map((n, i) =>
        i === nIdx ? { ...n, lecciones: (n.lecciones || []).filter((_, j) => j !== lIdx) } : n,
      ),
    )
  }

  const handleTituloLeccion = (nIdx, lIdx, titulo) => {
    setModulos((prev) =>
      prev.map((n, i) => {
        if (i !== nIdx) return n
        return {
          ...n,
          lecciones: (n.lecciones || []).map((l, j) => (j === lIdx ? { ...l, titulo } : l)),
        }
      }),
    )
  }

  const handleAgregarItem = (nIdx, lIdx, tipo) => {
    setModulos((prev) =>
      prev.map((n, i) => {
        if (i !== nIdx) return n
        return {
          ...n,
          lecciones: (n.lecciones || []).map((l, j) =>
            j === lIdx
              ? {
                  ...l,
                  items: [
                    ...(l.items || []),
                    tipo === 'youtube'
                      ? { id: nuevoId(), tipo: 'youtube', titulo: '', url: '', descripcion: '' }
                      : { id: nuevoId(), tipo: 'texto', titulo: '', cuerpo: '' },
                  ],
                }
              : l,
          ),
        }
      }),
    )
  }

  const handleItemChange = (nIdx, lIdx, iIdx, patch) => {
    setModulos((prev) =>
      prev.map((n, i) => {
        if (i !== nIdx) return n
        return {
          ...n,
          lecciones: (n.lecciones || []).map((l, j) => {
            if (j !== lIdx) return l
            return {
              ...l,
              items: (l.items || []).map((it, k) => (k === iIdx ? { ...it, ...patch } : it)),
            }
          }),
        }
      }),
    )
  }

  const handleEliminarItem = (nIdx, lIdx, iIdx) => {
    setModulos((prev) =>
      prev.map((n, i) => {
        if (i !== nIdx) return n
        return {
          ...n,
          lecciones: (n.lecciones || []).map((l, j) =>
            j === lIdx ? { ...l, items: (l.items || []).filter((_, k) => k !== iIdx) } : l,
          ),
        }
      }),
    )
  }

  const handleGuardar = async () => {
    if (!test?.id_test || !idEmpresa) return

    for (let n = 0; n < modulos.length; n++) {
      const nivel = modulos[n]
      if (!nivel.titulo?.trim()) {
        toast({ title: `Nivel ${n + 1}`, description: 'Falta el título.', status: 'warning' })
        return
      }
      for (let l = 0; l < (nivel.lecciones || []).length; l++) {
        const lec = nivel.lecciones[l]
        if (!lec.titulo?.trim()) {
          toast({
            title: `Nivel ${n + 1}, lección ${l + 1}`,
            description: 'Falta el título de la lección.',
            status: 'warning',
          })
          return
        }
        for (const it of lec.items || []) {
          if (it.tipo === 'youtube' && !String(it.url || '').trim()) {
            toast({ title: 'Video incompleto', description: 'Falta el link de YouTube.', status: 'warning' })
            return
          }
          if (it.tipo === 'texto' && !String(it.cuerpo || '').trim()) {
            toast({ title: 'Texto incompleto', description: 'Falta el contenido.', status: 'warning' })
            return
          }
        }
      }
    }

    const payload = modulos.map((n) => ({
      id: n.id,
      titulo: n.titulo.trim(),
      lecciones: (n.lecciones || []).map((l) => ({
        id: l.id,
        titulo: l.titulo.trim(),
        items: (l.items || []).map((it) =>
          it.tipo === 'youtube'
            ? {
                id: it.id,
                tipo: 'youtube',
                titulo: (it.titulo || '').trim(),
                url: String(it.url || '').trim(),
                descripcion: String(it.descripcion || '').trim(),
              }
            : {
                id: it.id,
                tipo: 'texto',
                titulo: (it.titulo || '').trim(),
                cuerpo: String(it.cuerpo || '').trim(),
              },
        ),
      })),
    }))

    setGuardando(true)
    try {
      const res = await actualizarModulosEvaluacion(supabase, test.id_test, idEmpresa, payload)
      toast({
        title: 'Niveles guardados',
        description: `${payload.length} nivel(es) de estudio actualizados.`,
        status: 'success',
        duration: 3000,
      })
      onGuardado?.({ ...test, modulos: res.modulos })
      onClose()
    } catch (e) {
      toast({ title: 'No se pudo guardar', description: e.message, status: 'error' })
    } finally {
      setGuardando(false)
    }
  }

  if (!test) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside" isCentered>
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent borderRadius="2xl" overflow="hidden">
        <ModalHeader borderBottomWidth="1px" borderColor="blackAlpha.100" py={4}>
          <Flex align="center" gap={2} pr={6}>
            <BookOpen size={18} />
            <Box minW={0}>
              <Text fontSize="md" fontWeight="semibold" color="brand.ink" noOfLines={1}>
                Niveles de estudio
              </Text>
              <Text fontSize="xs" color="blackAlpha.600" noOfLines={1}>
                {test.titulo}
              </Text>
            </Box>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={{ base: 4, md: 5 }}>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading fontSize="sm" color="brand.ink">
              Nivel → Lección → contenido
            </Heading>
            <Button size="sm" variant="outline" leftIcon={<Plus size={14} />} onClick={handleAgregarNivel}>
              Agregar nivel
            </Button>
          </Flex>

          <VStack spacing={4} align="stretch">
            {modulos.length === 0 ? (
              <Text fontSize="sm" color="blackAlpha.500">
                Sin niveles: el cuestionario queda libre. Agregue niveles para exigir estudio previo.
              </Text>
            ) : (
              modulos.map((nivel, nIdx) => (
                <Box
                  key={nivel.id}
                  p={4}
                  borderWidth="1px"
                  borderColor="blackAlpha.100"
                  borderRadius="lg"
                  bg="brand.soft"
                >
                  <Flex gap={2} mb={3}>
                    <Input
                      size="sm"
                      bg="white"
                      value={nivel.titulo}
                      onChange={(e) => handleTituloNivel(nIdx, e.target.value)}
                    />
                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      icon={<Trash2 size={14} />}
                      aria-label="Eliminar nivel"
                      onClick={() => handleEliminarNivel(nIdx)}
                    />
                  </Flex>
                  <Button
                    size="xs"
                    variant="outline"
                    mb={3}
                    leftIcon={<Plus size={12} />}
                    onClick={() => handleAgregarLeccion(nIdx)}
                  >
                    Agregar lección
                  </Button>
                  <VStack spacing={3} align="stretch">
                    {(nivel.lecciones || []).map((lec, lIdx) => (
                      <Box
                        key={lec.id}
                        p={3}
                        bg="white"
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="blackAlpha.100"
                      >
                        <Flex gap={2} mb={2} align="center">
                          <Badge fontSize="2xs">Lección {lIdx + 1}</Badge>
                          <Input
                            size="sm"
                            value={lec.titulo}
                            onChange={(e) => handleTituloLeccion(nIdx, lIdx, e.target.value)}
                          />
                          <IconButton
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            icon={<Trash2 size={13} />}
                            aria-label="Eliminar lección"
                            onClick={() => handleEliminarLeccion(nIdx, lIdx)}
                          />
                        </Flex>
                        <HStack mb={2}>
                          <Button
                            size="xs"
                            variant="outline"
                            leftIcon={<Plus size={12} />}
                            onClick={() => handleAgregarItem(nIdx, lIdx, 'texto')}
                          >
                            Texto
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            leftIcon={<Plus size={12} />}
                            onClick={() => handleAgregarItem(nIdx, lIdx, 'youtube')}
                          >
                            YouTube
                          </Button>
                        </HStack>
                        <VStack spacing={2} align="stretch">
                          {(lec.items || []).map((it, iIdx) => (
                            <Box
                              key={it.id}
                              p={3}
                              bg="brand.soft"
                              borderRadius="md"
                              borderWidth="1px"
                              borderColor="blackAlpha.100"
                            >
                              <Flex justify="space-between" mb={2}>
                                <Badge fontSize="2xs">
                                  {it.tipo === 'youtube' ? 'YouTube' : 'Texto'}
                                </Badge>
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  icon={<X size={13} />}
                                  aria-label="Quitar"
                                  onClick={() => handleEliminarItem(nIdx, lIdx, iIdx)}
                                />
                              </Flex>
                              <Input
                                size="sm"
                                mb={2}
                                bg="white"
                                placeholder="Título"
                                value={it.titulo || ''}
                                onChange={(e) =>
                                  handleItemChange(nIdx, lIdx, iIdx, { titulo: e.target.value })
                                }
                              />
                              {it.tipo === 'youtube' ? (
                                <>
                                  <Input
                                    size="sm"
                                    mb={2}
                                    bg="white"
                                    placeholder="https://youtube.com/..."
                                    value={it.url || ''}
                                    onChange={(e) =>
                                      handleItemChange(nIdx, lIdx, iIdx, { url: e.target.value })
                                    }
                                  />
                                  <Textarea
                                    size="sm"
                                    rows={2}
                                    bg="white"
                                    placeholder="Descripción (opcional)"
                                    value={it.descripcion || ''}
                                    onChange={(e) =>
                                      handleItemChange(nIdx, lIdx, iIdx, {
                                        descripcion: e.target.value,
                                      })
                                    }
                                  />
                                </>
                              ) : (
                                <Textarea
                                  size="sm"
                                  rows={3}
                                  bg="white"
                                  placeholder="Contenido..."
                                  value={it.cuerpo || ''}
                                  onChange={(e) =>
                                    handleItemChange(nIdx, lIdx, iIdx, { cuerpo: e.target.value })
                                  }
                                />
                              )}
                            </Box>
                          ))}
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              ))
            )}
          </VStack>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor="blackAlpha.100" gap={2}>
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            size="sm"
            leftIcon={<Check size={16} />}
            isLoading={guardando}
            onClick={handleGuardar}
          >
            Guardar niveles
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
