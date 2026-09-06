import { BrowserRouter, Route, Routes } from 'react-router-dom'
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  SignIn,
} from '@clerk/clerk-react'
import AdminLayout from './layouts/AdminLayout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<SignIn fallbackRedirectUrl="/dashboard" />}
        />
        <Route
          path="/dashboard/*"
          element={
            <>
              <SignedIn>
                <AdminLayout />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
