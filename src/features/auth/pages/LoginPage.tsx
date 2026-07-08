import { useState } from 'react'
import { LoginForm } from '../components/LoginForm'
import { SuperAdminBootstrapForm } from '../components/SuperAdminBootstrapForm'
import { BrandLogo } from '../../../shared/brand/BrandLogo'

export function LoginPage() {
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  function handleCreated(email: string) {
    setIsCreateMode(false)
    setSuccess(`Compte super admin créé pour ${email}. Vous pouvez vous connecter.`)
  }

  return (
    <div className="auth-card">
      <div className="brand-row">
        <BrandLogo className="brand-logo-auth" />
        <div>
          <p className="eyebrow">Top Teaser</p>
          <h1>Administration email</h1>
        </div>
      </div>
      <p className="auth-copy">
        Connectez-vous pour gérer les contacts, listes, templates et campagnes.
      </p>
      {success ? <div className="success-alert">{success}</div> : null}

      {isCreateMode ? (
        <SuperAdminBootstrapForm onCreated={handleCreated} />
      ) : (
        <LoginForm />
      )}

      <div className="auth-switch">
        <span>
          {isCreateMode
            ? 'Vous avez déjà un compte ?'
            : 'Pas encore de compte ?'}
        </span>
        <button
          className="secondary-button"
          onClick={() => {
            setSuccess(null)
            setIsCreateMode((current) => !current)
          }}
          type="button"
        >
          {isCreateMode ? 'Se connecter' : "S'inscrire"}
        </button>
      </div>
    </div>
  )
}
