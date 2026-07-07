import {
  BarChart3,
  FileText,
  Layers3,
  LayoutDashboard,
  LogOut,
  Mail,
  Send,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../features/auth/AuthProvider'
import { CampaignsPage } from '../features/campaigns/pages/CampaignsPage'
import { ContactListsPage } from '../features/contactLists/pages/ContactListsPage'
import { ContactsPage } from '../features/contacts/pages/ContactsPage'
import { EmailLogsPage } from '../features/emailLogs/pages/EmailLogsPage'
import { OverviewPage } from '../features/overview/pages/OverviewPage'
import { ProvidersPage } from '../features/providers/pages/ProvidersPage'
import { TemplatesPage } from '../features/templates/pages/TemplatesPage'

const navItems = [
  { id: 'overview', label: 'Vue générale', icon: LayoutDashboard },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'contactLists', label: 'Catégories contacts', icon: Layers3 },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'campaigns', label: 'Campagnes', icon: Send },
  { id: 'logs', label: 'Logs', icon: BarChart3 },
  { id: 'providers', label: 'Providers', icon: Mail },
] as const

type NavItemId = (typeof navItems)[number]['id']

export function AdminShell() {
  const { logoutAdmin, user } = useAuth()
  const [activeView, setActiveView] = useState<NavItemId>('overview')

  return (
    <main className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">TT</div>
          <div>
            <strong>Top Teaser</strong>
            <span>Email admin</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navigation principale">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                className={activeView === item.id ? 'active' : ''}
                key={item.id}
                onClick={() => setActiveView(item.id)}
                type="button"
              >
                <Icon aria-hidden="true" size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <button className="logout-button" onClick={logoutAdmin} type="button">
          <LogOut aria-hidden="true" size={18} />
          Déconnexion
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Session admin</p>
            <h1>Bienvenue, {user?.name}</h1>
          </div>
          <div className="user-chip">{user?.email}</div>
        </header>

        {activeView === 'overview' ? <OverviewPage /> : null}
        {activeView === 'contacts' ? <ContactsPage /> : null}
        {activeView === 'contactLists' ? <ContactListsPage /> : null}
        {activeView === 'templates' ? <TemplatesPage /> : null}
        {activeView === 'campaigns' ? <CampaignsPage /> : null}
        {activeView === 'logs' ? <EmailLogsPage /> : null}
        {activeView === 'providers' ? <ProvidersPage /> : null}
      </section>
    </main>
  )
}
