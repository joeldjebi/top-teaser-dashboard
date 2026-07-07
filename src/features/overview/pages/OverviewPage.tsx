import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  MailCheck,
  RadioTower,
  RefreshCw,
  Send,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../../../lib/apiClient'
import { useAuth } from '../../auth/AuthProvider'
import { fetchCampaigns } from '../../campaigns/api/campaignsApi'
import type { Campaign } from '../../campaigns/types/campaignTypes'
import { fetchContactLists } from '../../contactLists/api/contactListsApi'
import type { ContactList } from '../../contactLists/types/contactListTypes'
import { fetchContacts } from '../../contacts/api/contactsApi'
import type { Contact } from '../../contacts/types/contactTypes'
import { fetchEmailLogs } from '../../emailLogs/api/emailLogsApi'
import type { EmailLog } from '../../emailLogs/types/emailLogTypes'
import { fetchActiveMailProvider } from '../../providers/api/providersApi'
import type { ActiveMailProvider } from '../../providers/types/providerTypes'
import { fetchTemplates } from '../../templates/api/templatesApi'
import type { EmailTemplate } from '../../templates/types/templateTypes'

type OverviewData = {
  campaigns: Campaign[]
  contactLists: ContactList[]
  contacts: Contact[]
  logs: EmailLog[]
  provider: ActiveMailProvider | null
  templates: EmailTemplate[]
}

const emptyData: OverviewData = {
  campaigns: [],
  contactLists: [],
  contacts: [],
  logs: [],
  provider: null,
  templates: [],
}

const contactStatusLabels = {
  active: 'Actifs',
  invalid: 'Invalides',
  bounced: 'Rebonds',
  unsubscribed: 'Désabonnés',
}

export function OverviewPage() {
  const { token } = useAuth()
  const [data, setData] = useState<OverviewData>(emptyData)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadOverview = useCallback(async () => {
    if (!token) {
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const [
        contactsResponse,
        listsResponse,
        templatesResponse,
        campaignsResponse,
        logsResponse,
        providerResponse,
      ] = await Promise.all([
        fetchContacts(token),
        fetchContactLists(token),
        fetchTemplates(token),
        fetchCampaigns(token),
        fetchEmailLogs(token),
        fetchActiveMailProvider(token).catch(() => ({ data: null })),
      ])

      setData({
        campaigns: campaignsResponse.data,
        contactLists: listsResponse.data,
        contacts: contactsResponse.data,
        logs: logsResponse.data,
        provider: providerResponse.data,
        templates: templatesResponse.data,
      })
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : 'Impossible de charger la vue générale.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadOverview()
  }, [loadOverview])

  const computed = useMemo(() => buildOverviewMetrics(data), [data])

  return (
    <div className="overview-page">
      <section className="page-hero overview-hero">
        <div>
          <p className="eyebrow">Vue générale</p>
          <h1>Pilotez vos campagnes email en un coup d’œil.</h1>
          <p className="muted">
            Suivez la qualité de vos contacts, la performance des envois et la
            santé de votre provider depuis un tableau de bord centralisé.
          </p>
        </div>
        <button className="secondary-button" onClick={loadOverview} type="button">
          <RefreshCw size={18} />
          Actualiser
        </button>
      </section>

      {error ? <div className="form-alert">{error}</div> : null}

      <section className="overview-kpi-grid">
        <OverviewKpiCard
          icon={Users}
          label="Contacts actifs"
          tone="green"
          value={computed.activeContacts}
          detail={`${computed.contactsGrowth} ajout(s) sur 7 jours`}
        />
        <OverviewKpiCard
          icon={Send}
          label="Campagnes envoyées"
          tone="blue"
          value={computed.sentCampaigns}
          detail={`${computed.readyCampaigns} prête(s), ${computed.sendingCampaigns} en cours`}
        />
        <OverviewKpiCard
          icon={MailCheck}
          label="Taux de réussite"
          tone="teal"
          value={`${computed.deliveryRate}%`}
          detail={`${computed.sentLogs} envoyés, ${computed.failedLogs} échecs`}
        />
        <OverviewKpiCard
          icon={FileText}
          label="Templates"
          tone="amber"
          value={data.templates.length}
          detail={`${data.contactLists.length} catégorie(s) contacts`}
        />
      </section>

      <section className="overview-main-grid">
        <div className="overview-panel overview-chart-panel">
          <PanelTitle
            icon={BarChart3}
            title="Performance des 7 derniers jours"
            eyebrow="Envois"
          />
          {isLoading ? (
            <div className="loading-state">Chargement du graphique...</div>
          ) : (
            <SevenDayBarChart days={computed.lastSevenDays} />
          )}
        </div>

        <div className="overview-panel overview-provider-panel">
          <PanelTitle icon={RadioTower} title="Provider actif" eyebrow="Email" />
          <div className="provider-health-card">
            <div>
              <strong>{data.provider?.name ?? 'Non configuré'}</strong>
              <span>
                {data.provider?.health.configured
                  ? 'Configuration opérationnelle'
                  : 'Configuration à compléter'}
              </span>
            </div>
            <span
              className={
                data.provider?.health.configured
                  ? 'health-pill ready'
                  : 'health-pill warning'
              }
            >
              {data.provider?.health.configured ? 'Prêt' : 'Attention'}
            </span>
          </div>
          <div className="overview-mini-list">
            <MiniRow label="Provider" value={data.provider?.key ?? '--'} />
            <MiniRow
              label="Champs manquants"
              value={data.provider?.health.missingConfig.length ?? '--'}
            />
            <MiniRow label="Mode recommandé" value="Broadcast / Bulk" />
          </div>
        </div>
      </section>

      <section className="overview-secondary-grid">
        <div className="overview-panel">
          <PanelTitle icon={Activity} title="Qualité de la base" eyebrow="Contacts" />
          <DonutChart
            items={computed.contactStatusBreakdown}
            total={data.contacts.length}
          />
        </div>

        <div className="overview-panel">
          <PanelTitle icon={Clock3} title="Campagnes récentes" eyebrow="Suivi" />
          <div className="overview-timeline">
            {computed.recentCampaigns.length === 0 ? (
              <EmptyOverviewState text="Aucune campagne récente." />
            ) : (
              computed.recentCampaigns.map((campaign) => (
                <div className="timeline-row" key={campaign.id}>
                  <span className={`timeline-dot ${campaign.status}`} />
                  <div>
                    <strong>{campaign.name}</strong>
                    <span>
                      {campaign.subject} · {formatStatus(campaign.status)}
                    </span>
                  </div>
                  <small>{formatDate(campaign.createdAt)}</small>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="overview-panel">
          <PanelTitle
            icon={AlertTriangle}
            title="Points d’attention"
            eyebrow="Priorités"
          />
          <div className="overview-action-list">
            {computed.actions.map((action) => {
              const Icon = action.good ? CheckCircle2 : AlertTriangle
              return (
                <div
                  className={`action-row ${action.good ? 'good' : 'warning'}`}
                  key={action.label}
                >
                  <Icon size={18} />
                  <div>
                    <strong>{action.label}</strong>
                    <span>{action.detail}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

function buildOverviewMetrics(data: OverviewData) {
  const activeContacts = data.contacts.filter(
    (contact) => contact.status === 'active',
  ).length
  const readyCampaigns = data.campaigns.filter(
    (campaign) => campaign.status === 'ready',
  ).length
  const sendingCampaigns = data.campaigns.filter(
    (campaign) => campaign.status === 'sending',
  ).length
  const sentCampaigns = data.campaigns.filter(
    (campaign) => campaign.status === 'sent',
  ).length
  const sentLogs = data.logs.filter((log) => log.status === 'sent').length
  const failedLogs = data.logs.filter((log) => log.status === 'failed').length
  const deliveryTotal = sentLogs + failedLogs
  const deliveryRate =
    deliveryTotal === 0 ? 0 : Math.round((sentLogs / deliveryTotal) * 100)
  const contactsGrowth = countSince(data.contacts, 7)

  const contactStatusBreakdown = Object.entries(contactStatusLabels).map(
    ([status, label]) => ({
      label,
      value: data.contacts.filter((contact) => contact.status === status).length,
    }),
  )

  const lastSevenDays = buildSevenDaySeries(data.logs)
  const recentCampaigns = [...data.campaigns]
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    )
    .slice(0, 5)

  const actions = [
    {
      good: data.provider?.health.configured ?? false,
      label: 'Provider email',
      detail: data.provider?.health.configured
        ? 'Le provider actif est prêt pour les envois.'
        : 'Complétez la configuration du provider actif.',
    },
    {
      good: activeContacts > 0,
      label: 'Base de contacts',
      detail:
        activeContacts > 0
          ? `${activeContacts} contact(s) actif(s) disponibles.`
          : 'Ajoutez ou importez des contacts actifs.',
    },
    {
      good: readyCampaigns + sendingCampaigns > 0,
      label: 'Pipeline campagnes',
      detail:
        readyCampaigns + sendingCampaigns > 0
          ? `${readyCampaigns + sendingCampaigns} campagne(s) à suivre.`
          : 'Préparez une campagne pour lancer le pipeline.',
    },
  ]

  return {
    actions,
    activeContacts,
    contactStatusBreakdown,
    contactsGrowth,
    deliveryRate,
    failedLogs,
    lastSevenDays,
    readyCampaigns,
    recentCampaigns,
    sendingCampaigns,
    sentCampaigns,
    sentLogs,
  }
}

function OverviewKpiCard({
  detail,
  icon: Icon,
  label,
  tone,
  value,
}: {
  detail: string
  icon: LucideIcon
  label: string
  tone: 'amber' | 'blue' | 'green' | 'teal'
  value: number | string
}) {
  return (
    <div className={`overview-kpi-card ${tone}`}>
      <div className="overview-kpi-icon">
        <Icon size={20} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  )
}

function PanelTitle({
  eyebrow,
  icon: Icon,
  title,
}: {
  eyebrow: string
  icon: LucideIcon
  title: string
}) {
  return (
    <div className="overview-panel-title">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <Icon size={20} />
    </div>
  )
}

function SevenDayBarChart({
  days,
}: {
  days: Array<{ day: string; failed: number; sent: number }>
}) {
  const max = Math.max(...days.map((day) => day.sent + day.failed), 1)

  return (
    <div className="overview-bar-chart">
      {days.map((day) => {
        const sentHeight = Math.max((day.sent / max) * 100, day.sent ? 8 : 0)
        const failedHeight = Math.max(
          (day.failed / max) * 100,
          day.failed ? 8 : 0,
        )

        return (
          <div className="bar-day" key={day.day}>
            <div className="bar-track">
              <span
                className="bar-failed"
                style={{ height: `${failedHeight}%` }}
              />
              <span className="bar-sent" style={{ height: `${sentHeight}%` }} />
            </div>
            <strong>{day.sent + day.failed}</strong>
            <small>{day.day}</small>
          </div>
        )
      })}
    </div>
  )
}

function DonutChart({
  items,
  total,
}: {
  items: Array<{ label: string; value: number }>
  total: number
}) {
  const active = items[0]?.value ?? 0
  const activePercent = total === 0 ? 0 : Math.round((active / total) * 100)

  return (
    <div className="donut-layout">
      <div
        className="donut-chart"
        style={{ '--active-percent': `${activePercent}%` } as CSSProperties}
      >
        <strong>{activePercent}%</strong>
        <span>actifs</span>
      </div>
      <div className="donut-legend">
        {items.map((item) => (
          <MiniRow key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </div>
  )
}

function MiniRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="mini-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function EmptyOverviewState({ text }: { text: string }) {
  return <div className="empty-state compact-empty">{text}</div>
}

function buildSevenDaySeries(logs: EmailLog[]) {
  const formatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' })
  const today = new Date()

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    const key = date.toISOString().slice(0, 10)

    const dayLogs = logs.filter((log) => log.createdAt.slice(0, 10) === key)

    return {
      day: formatter.format(date).replace('.', ''),
      failed: dayLogs.filter((log) => log.status === 'failed').length,
      sent: dayLogs.filter((log) => log.status === 'sent').length,
    }
  })
}

function countSince(items: Array<{ createdAt: string }>, days: number) {
  const start = new Date()
  start.setDate(start.getDate() - days)

  return items.filter((item) => new Date(item.createdAt) >= start).length
}

function formatStatus(status: Campaign['status']) {
  const labels: Record<Campaign['status'], string> = {
    cancelled: 'Annulée',
    draft: 'Brouillon',
    failed: 'Échec',
    ready: 'Prête',
    sending: 'En cours',
    sent: 'Envoyée',
  }

  return labels[status]
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value))
}
