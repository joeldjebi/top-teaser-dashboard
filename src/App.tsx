import { AuthProvider, useAuth } from './features/auth/AuthProvider'
import { LoginPage } from './features/auth/pages/LoginPage'
import { AdminShell } from './layouts/AdminShell'
import { AuthLayout } from './layouts/AuthLayout'
import { ConfirmDialogProvider } from './shared/confirm/ConfirmDialogProvider'
import './App.css'

function AppContent() {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return (
      <AuthLayout>
        <div className="auth-card">
          <div className="brand-mark">TT</div>
          <p className="muted">Chargement de la session...</p>
        </div>
      </AuthLayout>
    )
  }

  if (!isAuthenticated) {
    return (
      <AuthLayout>
        <LoginPage />
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
