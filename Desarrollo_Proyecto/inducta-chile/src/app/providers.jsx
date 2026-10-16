import { ChakraProvider } from '@chakra-ui/react'
import { ClerkProvider } from '@clerk/clerk-react'
import { esES } from '@clerk/localizations'
import AuthRolBootstrap from '../components/auth/AuthRolBootstrap'
import { env } from '../lib/env'
import { clerkAppearance } from '../theme/clerkAppearance'
import { theme } from '../theme/theme'

export function AppProviders({ children }) {
  return (
    <ClerkProvider
      publishableKey={env.clerkPublishableKey}
      localization={esES}
      appearance={clerkAppearance}
      signInUrl="/entrar"
      signUpUrl="/acceso/registro"
      afterSignOutUrl="/"
    >
      <ChakraProvider theme={theme}>
        <AuthRolBootstrap />
        {children}
      </ChakraProvider>
    </ClerkProvider>
  )
}
