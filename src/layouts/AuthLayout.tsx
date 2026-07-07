import type { ReactNode } from 'react'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-layout">
      <section className="auth-panel">{children}</section>
      <aside className="auth-aside">
        <div className="aside-content">
          <p className="eyebrow">Mailing MVP</p>
          <h2>Une base propre pour envoyer, mesurer et optimiser.</h2>
          <div className="aside-metrics">
            <span>Contacts</span>
            <strong>Templates</strong>
            <span>Campagnes</span>
          </div>
        </div>
      </aside>
    </main>
  )
}
