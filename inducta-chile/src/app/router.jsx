import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
} from '@clerk/clerk-react'
import AdminLayout from '../layouts/AdminLayout'
import DashboardPage from '../pages/DashboardPage'

function ProtectedDashboard() {
  return (
    <>
      <SignedIn>
        <AdminLayout />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/sign-in" replace />} />
        <Route
          path="/sign-in/*"
          element={<SignIn fallbackRedirectUrl="/dashboard" />}
        />
        <Route
          path="/sign-up/*"
          element={<SignUp fallbackRedirectUrl="/dashboard" />}
        />
        <Route path="/dashboard" element={<ProtectedDashboard />}>
          <Route index element={<DashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
