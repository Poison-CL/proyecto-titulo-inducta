import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useAuth } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { SEGUNDOS_MODAL_TEMPORAL } from '../../lib/cuentaTemporalLifecycle'
import { CompletarCuentaForm } from './CompletarCuentaForm'

const SEGUNDOS_BLOQUEO = SEGUNDOS_MODAL_TEMPORAL

export function ModalCuentaTemporal({ isOpen, onCerrar, onCompletado, idEmpresa }) {
  const toast = useToast()
  const { getToken } = useAuth()
  const [restantes, setRestantes] = useState(SEGUNDOS_BLOQUEO)
  const [puedeCerrar, setPuedeCerrar] = useState(false)
  const [paso, setPaso] = useState('aviso')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setRestantes(SEGUNDOS_BLOQUEO)
    setPuedeCerrar(false)
    setPaso('aviso')
    const t0 = Date.now()
    const id = setInterval(() => {
      const left = Math.max(0, SEGUNDOS_BLOQUEO - Math.floor((Date.now() - t0) / 1000))
      setRestantes(left)
      if (left === 0) {
        setPuedeCerrar(true)
        clearInterval(id)
      }
    }, 250)
    return () => clearInterval(id)
  }, [isOpen])

  const handleCompletar = async (payload) => {
    if (!idEmpresa) {
      toast({ title: 'Error', description: 'Sin empresa activa.', status: 'error', duration: 4000 })
      return
    }
    setEnviando(true)
    try {
      const token = await getToken()
      const base = import.meta.env.VITE_SUPABASE_URL
      const res = await fetch(`${base}/functions/v1/completar-cuenta-temporal`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...payload, id_empresa: idEmpresa }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'No se pudo completar la cuenta')
      toast({
        title: 'Cuenta verificada',
        description: 'Ya puede invitar colaboradores. Use el nuevo correo en el próximo inicio de sesión.',
        status: 'success',
        duration: 6000,
      })
      onCompletado?.()
      onCerrar?.()
    } catch (e) {
      toast({ title: 'Error', description: e.message, status: 'error', duration: 5000 })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (puedeCerrar) onCerrar?.()
      }}
      closeOnOverlayClick={puedeCerrar}
      closeOnEsc={puedeCerrar}
      isCentered
      size="lg"
      blockScrollOnMount
    >
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent borderRadius="16px" mx={4}>
        <ModalHeader fontFamily="heading" fontWeight={600} pb={2} color="brand.ink">
          Cuenta temporal
        </ModalHeader>
        <ModalBody>
          {paso === 'aviso' ? (
            <Stack spacing={4}>
              <Text color="brand.ink" lineHeight={1.65}>
                Su cuenta es temporal. Debe reemplazar el correo y la contraseña generados por datos reales de su
                empresa. Mientras no lo haga, no podrá crear ni invitar usuarios.
              </Text>
              <Box bg="brand.wash" borderRadius="12px" px={4} py={3}>
                <Text fontSize="sm" color="blackAlpha.700" lineHeight={1.55}>
                  Si no actualiza sus datos en 24 horas, la cuenta se deshabilitará. Al día siguiente se eliminará.
                </Text>
              </Box>
              {!puedeCerrar && (
                <Text fontSize="sm" fontWeight={600} color="brand.primary">
                  Espere {restantes}s para continuar…
                </Text>
              )}
            </Stack>
          ) : (
            <CompletarCuentaForm onSubmit={handleCompletar} isLoading={enviando} />
          )}
        </ModalBody>
        <ModalFooter gap={3}>
          {paso === 'aviso' ? (
            <>
              <Button variant="ghost" isDisabled={!puedeCerrar} onClick={() => puedeCerrar && onCerrar?.()}>
                Más tarde
              </Button>
              <Button
                bg="brand.primary"
                color="white"
                _hover={{ bg: 'brand.primaryDark' }}
                isDisabled={!puedeCerrar}
                onClick={() => setPaso('form')}
              >
                Completar ahora
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => setPaso('aviso')} isDisabled={enviando}>
              Volver
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
