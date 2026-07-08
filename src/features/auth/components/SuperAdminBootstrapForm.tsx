import { ShieldCheck, UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ApiError } from '../../../lib/apiClient'
import { createSuperAdminAccount } from '../api/authApi'

type SuperAdminBootstrapFormProps = {
  onCreated: (email: string) => void
}

export function SuperAdminBootstrapForm({
  onCreated,
}: SuperAdminBootstrapFormProps) {
  const [name, setName] = useState('Super Admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password !== passwordConfirmation) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setIsSubmitting(true)

    try {
      await createSuperAdminAccount({ name, email, password })
      onCreated(email)
    } catch (creationError) {
      setError(
        creationError instanceof ApiError
          ? creationError.message
          : 'Création impossible pour le moment.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="login-form bootstrap-form" onSubmit={handleSubmit}>
      <div className="bootstrap-note">
        <ShieldCheck aria-hidden="true" size={18} />
        <span>Ce compte racine peut être créé une seule fois.</span>
      </div>

      {error ? <div className="form-alert">{error}</div> : null}

      <label className="field">
        <span>Nom complet</span>
        <div className="input-shell">
          <input
            autoComplete="name"
            onChange={(event) => setName(event.target.value)}
            required
            type="text"
            value={name}
          />
        </div>
      </label>

      <label className="field">
        <span>Email</span>
        <div className="input-shell">
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            required
            type="email"
            value={email}
          />
        </div>
      </label>

      <label className="field">
        <span>Mot de passe</span>
        <div className="input-shell">
          <input
            autoComplete="new-password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </div>
      </label>

      <label className="field">
        <span>Confirmer le mot de passe</span>
        <div className="input-shell">
          <input
            autoComplete="new-password"
            minLength={8}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            required
            type="password"
            value={passwordConfirmation}
          />
        </div>
      </label>

      <button className="primary-button" disabled={isSubmitting} type="submit">
        <UserPlus aria-hidden="true" size={18} />
        {isSubmitting ? 'Création...' : 'Créer le compte'}
      </button>
    </form>
  )
}
