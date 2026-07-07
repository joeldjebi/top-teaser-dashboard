import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  return (
    <div className="auth-card">
      <div className="brand-row">
        <div className="brand-mark">TT</div>
        <div>
          <p className="eyebrow">Top Teaser</p>
          <h1>Administration email</h1>
        </div>
      </div>
      <p className="auth-copy">
        Connectez-vous pour gerer les contacts, listes, templates et campagnes.
      </p>
      <LoginForm />
    </div>
  )
}
