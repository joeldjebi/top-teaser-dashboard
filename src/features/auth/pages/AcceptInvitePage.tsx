import { CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { ApiError } from '../../../lib/apiClient'
import { BrandLogo } from '../../../shared/brand/BrandLogo'
import { acceptAdminInvitation } from '../api/authApi'

export function AcceptInvitePage() {
  const token = useMemo(
    () => new URLSearchParams(window.location.search).get('token') ?? '',
    [],
  )
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!token) {
      setError('Lien d’invitation invalide.')
      return
    }

    if (password !== confirmation) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await acceptAdminInvitation({ token, password })
      setSuccess(response.message)
      setPassword('')
      setConfirmation('')
      window.setTimeout(() => {
        window.location.assign('/admin')
      }, 1200)
    } catch (inviteError) {
      setError(
        inviteError instanceof ApiError
          ? inviteError.message
          : 'Impossible d’activer cette invitation.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-card accept-invite-card">
      <div className="brand-row">
        <BrandLogo className="brand-logo-auth" />
        <div>
          <p className="eyebrow">Invitation admin</p>
          <h1>Définir votre mot de passe</h1>
        </div>
      </div>
      <p className="auth-copy">
        Choisissez un mot de passe sécurisé pour finaliser l’activation de votre
        compte administrateur.
      </p>

      <form className="login-form" onSubmit={handleSubmit}>
        {error ? <div className="form-alert">{error}</div> : null}
        {success ? (
          <div className="success-alert">
            <CheckCircle2 size={18} />
            {success}
          </div>
        ) : null}

        <label className="field">
          <span>Nouveau mot de passe</span>
          <div className="input-shell">
            <LockKeyhole aria-hidden="true" size={18} />
            <input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 caractères"
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
            />
            <button
              aria-label={
                showPassword
                  ? 'Masquer le mot de passe'
                  : 'Afficher le mot de passe'
              }
              className="icon-button"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        <label className="field">
          <span>Confirmer le mot de passe</span>
          <div className="input-shell">
            <KeyRound aria-hidden="true" size={18} />
            <input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder="Répéter le mot de passe"
              required
              type={showPassword ? 'text' : 'password'}
              value={confirmation}
            />
          </div>
        </label>

        <button className="primary-button" disabled={isSubmitting} type="submit">
          <CheckCircle2 aria-hidden="true" size={18} />
          {isSubmitting ? 'Activation...' : 'Activer mon compte'}
        </button>
      </form>
    </div>
  )
}
