import { Save } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ApiError } from '../../../lib/apiClient'
import { useAuth } from '../../auth/AuthProvider'
import {
  updateCurrentUserPassword,
  updateCurrentUserProfile,
} from '../../auth/api/authApi'

export function AccountPage() {
  const { refreshUser, token, user } = useAuth()
  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
  })
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await updateCurrentUserProfile(token, profile)
      await refreshUser()
      setSuccess('Profil mis à jour.')
    } catch (profileError) {
      setError(
        profileError instanceof ApiError
          ? profileError.message
          : 'Impossible de mettre à jour le profil.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await updateCurrentUserPassword(token, { password })
      setPassword('')
      setSuccess('Mot de passe mis à jour.')
    } catch (passwordError) {
      setError(
        passwordError instanceof ApiError
          ? passwordError.message
          : 'Impossible de modifier le mot de passe.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="account-page">
      <section className="page-hero compact-hero">
        <div>
          <p className="eyebrow">Mon compte</p>
          <h1>Gérez vos informations administrateur.</h1>
          <p className="muted">
            Mettez à jour votre identité, votre email de connexion et votre mot
            de passe.
          </p>
        </div>
      </section>

      {error ? <div className="form-alert">{error}</div> : null}
      {success ? <div className="success-alert">{success}</div> : null}

      <section className="account-grid">
        <form className="admin-panel stack-form" onSubmit={handleProfileSubmit}>
          <div>
            <p className="eyebrow">Profil</p>
            <h2>Informations personnelles</h2>
          </div>
          <label className="field">
            <span>Nom</span>
            <input
              onChange={(event) =>
                setProfile((current) => ({ ...current, name: event.target.value }))
              }
              required
              value={profile.name}
            />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              onChange={(event) =>
                setProfile((current) => ({ ...current, email: event.target.value }))
              }
              required
              type="email"
              value={profile.email}
            />
          </label>
          <button className="primary-button" disabled={isSaving}>
            <Save size={18} />
            Enregistrer
          </button>
        </form>

        <form className="admin-panel stack-form" onSubmit={handlePasswordSubmit}>
          <div>
            <p className="eyebrow">Sécurité</p>
            <h2>Mot de passe</h2>
          </div>
          <label className="field">
            <span>Nouveau mot de passe</span>
            <input
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          <button className="primary-button" disabled={isSaving}>
            <Save size={18} />
            Mettre à jour
          </button>
        </form>
      </section>
    </div>
  )
}
