import { AuthProvider, useAuth } from './features/auth/AuthProvider'
import { AcceptInvitePage } from './features/auth/pages/AcceptInvitePage'
import { LoginPage } from './features/auth/pages/LoginPage'
import { AdminShell } from './layouts/AdminShell'
import { AuthLayout } from './layouts/AuthLayout'
import { BrandLogo } from './shared/brand/BrandLogo'
import { ConfirmDialogProvider } from './shared/confirm/ConfirmDialogProvider'
import './App.css'

function AppContent() {
  const { isAuthenticated, isBootstrapping } = useAuth()
  const isAcceptInvitePage = window.location.pathname === '/accept-invite'

  if (isBootstrapping) {
    return (
      <AuthLayout>
        <div className="auth-card">
          <BrandLogo className="brand-logo-loading" />
          <p className="muted">Chargement de la session...</p>
        </div>
      </AuthLayout>
    )
  }

  if (!isAuthenticated) {
    return (
      <AuthLayout>
        {isAcceptInvitePage ? <AcceptInvitePage /> : <LoginPage />}
      </AuthLayout>
    )
  }

  return <AdminShell />
}

function App() {
  return (
    <AuthProvider>
      <ConfirmDialogProvider>
        <AppContent />
      </ConfirmDialogProvider>
    </AuthProvider>
  )
}

export default App
