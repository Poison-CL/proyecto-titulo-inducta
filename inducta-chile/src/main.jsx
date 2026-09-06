import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
<<<<<<< Updated upstream
import { ClerkProvider } from '@clerk/clerk-react'
import { SaasProvider } from '@saas-ui/react'
import App from './App.jsx'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      <SaasProvider>
        <App />
      </SaasProvider>
    </ClerkProvider>
=======
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
>>>>>>> Stashed changes
  </StrictMode>,
)
