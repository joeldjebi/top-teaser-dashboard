import {
  BarChart3,
  FileText,
  Layers3,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPinned,
  KanbanSquare,
  Send,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { AccountPage } from '../features/account/pages/AccountPage'
import { AdminUsersPage } from '../features/adminUsers/pages/AdminUsersPage'
import { useAuth } from '../features/auth/AuthProvider'
import { CampaignsPage } from '../features/campaigns/pages/CampaignsPage'
import { CampaignPipelinePage } from '../features/campaignPipeline/pages/CampaignPipelinePage'
import { ContactListsPage } from '../features/contactLists/pages/ContactListsPage'
import { ContactsPage } from '../features/contacts/pages/ContactsPage'
import { EmailLogsPage } from '../features/emailLogs/pages/EmailLogsPage'
import { LocationsPage } from '../features/locations/pages/LocationsPage'
import { OverviewPage } from '../features/overview/pages/OverviewPage'
import { ProvidersPage } from '../features/providers/pages/ProvidersPage'
import { TemplatesPage } from '../features/templates/pages/TemplatesPage'
import { BrandLogo } from '../shared/brand/BrandLogo'

const navItems = [
  { id: 'overview', label: 'Vue générale', icon: LayoutDashboard },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'locations', label: 'Pays & communes', icon: MapPinned },
  { id: 'contactLists', label: 'Catégories contacts', icon: Layers3 },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'campaigns', label: 'Campagnes', icon: Send },
  { id: 'pipeline', label: 'Pipeline campagnes', icon: KanbanSquare },
  { id: 'logs', label: 'Logs', icon: BarChart3 },
  { id: 'providers', label: 'Providers', icon: Mail },
  { id: 'admins', label: 'Admins & rôles', icon: ShieldCheck },
  { id: 'account', label: 'Mon compte', icon: UserCog },
] as const

type NavItemId = (typeof navItems)[number]['id']

export function AdminShell() {
  const { logoutAdmin, user } = useAuth()
  const [activeView, setActiveView] = useState<NavItemId>('overview')
  const visibleNavItems = navItems.filter((item) => {
    if (item.id === 'account') return true
    if (item.id === 'locations') return user?.permissions.contacts.read
    if (item.id === 'pipeline') return user?.permissions.campaigns.read
    return user?.permissions[item.id]?.read
  })

  return (
    <main className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <BrandLogo className="brand-logo-sidebar" />
        </div>

        <nav className="sidebar-nav" aria-label="Navigation principale">
          {visibleNavItems.map((item) => {
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
        {activeView === 'locations' ? <LocationsPage /> : null}
        {activeView === 'contactLists' ? <ContactListsPage /> : null}
        {activeView === 'templates' ? <TemplatesPage /> : null}
        {activeView === 'campaigns' ? <CampaignsPage /> : null}
        {activeView === 'pipeline' ? <CampaignPipelinePage /> : null}
        {activeView === 'logs' ? <EmailLogsPage /> : null}
        {activeView === 'providers' ? <ProvidersPage /> : null}
        {activeView === 'admins' ? <AdminUsersPage /> : null}
        {activeView === 'account' ? <AccountPage /> : null}
      </section>
    </main>
  )
}
