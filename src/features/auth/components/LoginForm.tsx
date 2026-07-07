import { Eye, EyeOff, LockKeyhole, LogIn, Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ApiError } from '../../../lib/apiClient'
import { useAuth } from '../AuthProvider'

export function LoginForm() {
  const { loginAdmin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await loginAdmin({ email, password })
    } catch (loginError) {
      setError(
        loginError instanceof ApiError
          ? loginError.message
          : 'Connexion impossible pour le moment.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {error ? <div className="form-alert">{error}</div> : null}

      <label className="field">
        <span>Email</span>
        <div className="input-shell">
          <Mail aria-hidden="true" size={18} />
          <input
            autoComplete="email"
            name="email"
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
          <LockKeyhole aria-hidden="true" size={18} />
          <input
            autoComplete="current-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Votre mot de passe"
            required
            type={showPassword ? 'text' : 'password'}
            value={password}
          />
          <button
            aria-label={
              showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
            }
            className="icon-button"
            onClick={() => setShowPassword((current) => !current)}
            type="button"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>

      <button className="primary-button" disabled={isSubmitting} type="submit">
        <LogIn aria-hidden="true" size={18} />
        {isSubmitting ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  )
}
