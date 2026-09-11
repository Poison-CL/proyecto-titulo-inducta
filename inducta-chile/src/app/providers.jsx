import { ClerkProvider } from '@clerk/clerk-react'
import { SaasProvider } from '@saas-ui/react'
import { env } from '../lib/env'

export function AppProviders({ children }) {
  return (
    <ClerkProvider
      publishableKey={env.clerkPublishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/sign-in"
    >
      <SaasProvider>{children}</SaasProvider>
    </ClerkProvider>
  )
}
