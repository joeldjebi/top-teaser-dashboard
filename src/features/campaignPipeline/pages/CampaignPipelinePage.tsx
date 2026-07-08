import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  Layers3,
  PauseCircle,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  TimerReset,
  Webhook,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../../../lib/apiClient'
import { useAuth } from '../../auth/AuthProvider'
import {
  fetchCampaignChannelStatuses,
  fetchCampaigns,
} from '../../campaigns/api/campaignsApi'
import type {
  Campaign,
  CampaignChannel,
  CampaignChannelStatus,
  CampaignStatus,
} from '../../campaigns/types/campaignTypes'
import {
  fetchMonitoringOverview,
  type MonitoringOverview,
} from '../../overview/api/monitoringApi'

type PipelineColumn = {
  description: string
  icon: typeof Clock3
  label: string
  status: CampaignStatus
}

const columns: PipelineColumn[] = [
  {
    status: 'ready',
    label: 'En attente',
    description: 'Campagnes prêtes ou planifiées',
    icon: Clock3,
  },
  {
    status: 'sending',
    label: 'En cours',
    description: 'Envois actifs, queue ou Bulk',
    icon: Send,
  },
  {
    status: 'sent',
    label: 'Terminées',
    description: 'Campagnes envoyées',
    icon: CheckCircle2,
  },
  {
    status: 'failed',
    label: 'Échouées',
    description: 'Campagnes à corriger',
    icon: AlertTriangle,
  },
  {
    status: 'cancelled',
    label: 'Annulées',
    description: 'Campagnes stoppées',
    icon: PauseCircle,
  },
]

const channelLabels: Record<CampaignChannel, string> = {
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
}

function formatDate(value: string | null) {
  if (!value) return 'Non planifiée'

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getCampaignProgress(
  campaign: Campaign,
  channelStatuses: CampaignChannelStatus[],
) {
  const totals = channelStatuses.reduce(
    (acc, channel) => {
      acc.sent += channel.stats.sent
      acc.failed += channel.stats.failed
      acc.pending += channel.stats.pending
      acc.total +=
        channel.stats.sent + channel.stats.failed + channel.stats.pending
      return acc
    },
    { failed: 0, pending: 0, sent: 0, total: 0 },
  )

  const total = totals.total || campaign.recipientsCount || 0
  const completed = totals.sent + totals.failed
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)

  return {
    ...totals,
    percentage,
    total,
  }
}

export function CampaignPipelinePage() {
  const { token } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [channelStatuses, setChannelStatuses] = useState<
    Record<number, CampaignChannelStatus[]>
  >({})
  const [monitoring, setMonitoring] = useState<MonitoringOverview | null>(null)
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadPipeline = useCallback(async () => {
    if (!token) return

    setError(null)
    setIsLoading(true)

    try {
      const [campaignsResponse, monitoringResponse] = await Promise.all([
        fetchCampaigns(token),
        fetchMonitoringOverview(token),
      ])
      const loadedCampaigns = campaignsResponse.data
      const statusEntries = await Promise.all(
        loadedCampaigns.map(async (campaign) => {
          const response = await fetchCampaignChannelStatuses(token, campaign.id)
          return [campaign.id, response.data] as const
        }),
      )

      setCampaigns(loadedCampaigns)
      setMonitoring(monitoringResponse.data)
      setChannelStatuses(Object.fromEntries(statusEntries))
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : 'Impossible de charger le pipeline des campagnes.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadPipeline()
  }, [loadPipeline])

  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadPipeline()
    }, 15000)

    return () => window.clearInterval(interval)
  }, [loadPipeline])

  const visibleCampaigns = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return campaigns.filter((campaign) =>
      `${campaign.name} ${campaign.subject}`.toLowerCase().includes(normalizedQuery),
    )
  }, [campaigns, query])

  const stats = useMemo(() => {
    const waiting = campaigns.filter((campaign) => campaign.status === 'ready').length
    const running = campaigns.filter(
      (campaign) => campaign.status === 'sending',
    ).length
    const finished = campaigns.filter((campaign) => campaign.status === 'sent').length
    const failed = campaigns.filter((campaign) => campaign.status === 'failed').length

    return {
      failed,
      finished,
      running,
      total: campaigns.length,
      waiting,
    }
  }, [campaigns])

  return (
    <div className="pipeline-page">
      <section className="page-hero compact-hero">
        <div>
          <p className="eyebrow">Pipeline campagnes</p>
          <h1>Suivi opérationnel des campagnes.</h1>
          <p className="muted">
            Visualisez les campagnes en attente, en cours, terminées ou échouées,
            avec la progression et les canaux concernés.
          </p>
        </div>
        <button className="secondary-button" onClick={loadPipeline} type="button">
          <RefreshCw size={18} />
          Actualiser
        </button>
      </section>

      {error ? <div className="form-alert">{error}</div> : null}

      <section className="pipeline-kpi-grid">
        <PipelineKpi icon={Layers3} label="Total" value={stats.total} />
        <PipelineKpi icon={Clock3} label="En attente" value={stats.waiting} />
        <PipelineKpi icon={TimerReset} label="En cours" value={stats.running} />
        <PipelineKpi icon={CheckCircle2} label="Terminées" value={stats.finished} />
        <PipelineKpi icon={AlertTriangle} label="Échouées" value={stats.failed} />
      </section>

      <section className="pipeline-control-grid">
        <PipelineControlCard
          icon={TimerReset}
          title="Queue d’envoi"
          tone={
            monitoring?.scheduler.queue.failed
              ? 'danger'
              : monitoring?.scheduler.queue.running ||
                  monitoring?.scheduler.queue.queued
                ? 'warning'
                : 'ready'
          }
          items={[
            ['En attente', monitoring?.scheduler.queue.queued ?? 0],
            ['En cours', monitoring?.scheduler.queue.running ?? 0],
            ['Terminés', monitoring?.scheduler.queue.done ?? 0],
            ['Échecs', monitoring?.scheduler.queue.failed ?? 0],
          ]}
          footer={
            monitoring?.scheduler.queue.recentJobs?.[0]
              ? `Dernier job : ${monitoring.scheduler.queue.recentJobs[0].campaignName}`
              : 'Aucun job récent'
          }
        />

        <PipelineControlCard
          icon={Webhook}
          title="Webhooks providers"
          tone={
            monitoring?.recentProviderEvents.length
              ? 'ready'
              : 'neutral'
          }
          items={[
            ['Événements récents', monitoring?.recentProviderEvents.length ?? 0],
            [
              'Providers actifs',
              monitoring?.activeProviders.length ?? 0,
            ],
            [
              'Dernier provider',
              monitoring?.recentProviderEvents[0]?.provider ?? '--',
            ],
          ]}
          footer={
            monitoring?.recentProviderEvents[0]
              ? `${monitoring.recentProviderEvents[0].eventType} · ${formatDate(
                  monitoring.recentProviderEvents[0].occurredAt,
                )}`
              : 'Aucun webhook reçu récemment'
          }
        />

        <PipelineControlCard
          icon={DatabaseZap}
          title="Monitoring"
          tone={
            monitoring?.scheduler.lastRunError ||
            monitoring?.blockedCampaigns.length
              ? 'danger'
              : monitoring?.scheduler.isRunning
                ? 'ready'
                : 'warning'
          }
          items={[
            ['Scheduler', monitoring?.scheduler.isRunning ? 'Actif' : 'Arrêté'],
            ['Canaux en erreur', monitoring?.channelsByStatus.failed ?? 0],
            ['Campagnes bloquées', monitoring?.blockedCampaigns.length ?? 0],
            ['Erreurs techniques', monitoring?.recentTechnicalErrors.length ?? 0],
          ]}
          footer={
            monitoring?.scheduler.lastRunError
              ? `Erreur : ${monitoring.scheduler.lastRunError}`
              : monitoring?.scheduler.nextRunAt
                ? `Prochain contrôle : ${formatDate(monitoring.scheduler.nextRunAt)}`
                : 'Scheduler en attente'
          }
        />
      </section>

      <section className="pipeline-toolbar">
        <label className="search-shell">
          <Search size={18} />
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une campagne..."
            value={query}
          />
        </label>
        <span>
          {isLoading
            ? 'Synchronisation en cours...'
            : `${visibleCampaigns.length} campagne(s) affichée(s)`}
        </span>
      </section>

      <section className="pipeline-board">
        {columns.map((column) => {
          const Icon = column.icon
          const columnCampaigns = visibleCampaigns.filter(
            (campaign) => campaign.status === column.status,
          )

          return (
            <article className={`pipeline-column ${column.status}`} key={column.status}>
              <header>
                <div>
                  <Icon size={18} />
                  <strong>{column.label}</strong>
                </div>
                <span>{columnCampaigns.length}</span>
              </header>
              <p>{column.description}</p>

              <div className="pipeline-column-list">
                {columnCampaigns.length === 0 ? (
                  <div className="pipeline-empty">Aucune campagne</div>
                ) : (
                  columnCampaigns.map((campaign) => (
                    <PipelineCampaignCard
                      campaign={campaign}
                      channelStatuses={channelStatuses[campaign.id] ?? []}
                      key={campaign.id}
                    />
                  ))
                )}
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}

function PipelineKpi({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers3
  label: string
  value: number
}) {
  return (
    <div className="pipeline-kpi-card">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function PipelineControlCard({
  footer,
  icon: Icon,
  items,
  title,
  tone,
}: {
  footer: string
  icon: typeof ShieldCheck
  items: Array<[string, string | number]>
  title: string
  tone: 'danger' | 'neutral' | 'ready' | 'warning'
}) {
  return (
    <article className={`pipeline-control-card ${tone}`}>
      <header>
        <span>
          <Icon size={18} />
          {title}
        </span>
        <strong>{tone === 'ready' ? 'OK' : tone === 'danger' ? 'Alerte' : 'Suivi'}</strong>
      </header>
      <div className="pipeline-control-list">
        {items.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <p>{footer}</p>
    </article>
  )
}

function PipelineCampaignCard({
  campaign,
  channelStatuses,
}: {
  campaign: Campaign
  channelStatuses: CampaignChannelStatus[]
}) {
  const progress = getCampaignProgress(campaign, channelStatuses)
  const channels =
    channelStatuses.length > 0
      ? channelStatuses.map((channel) => ({
          channel: channel.channel,
          status: channel.status,
        }))
      : campaign.channels.map((channel) => ({
          channel: channel.channel,
          status: channel.status ?? campaign.status,
        }))

  return (
    <article className="pipeline-card">
      <div className="pipeline-card-heading">
        <div>
          <strong>{campaign.name}</strong>
          <span>{campaign.subject}</span>
        </div>
        <small>#{campaign.id}</small>
      </div>

      <div className="pipeline-progress">
        <span style={{ width: `${progress.percentage}%` }} />
      </div>

      <div className="pipeline-card-metrics">
        <span>{progress.percentage}%</span>
        <span>{progress.sent} envoyés</span>
        <span>{progress.failed} échecs</span>
      </div>

      <div className="pipeline-channel-tags">
        {channels.map((channel) => (
          <span className={`pipeline-channel-tag ${channel.status}`} key={channel.channel}>
            {channelLabels[channel.channel]}
          </span>
        ))}
      </div>

      <div className="pipeline-card-footer">
        <span>{campaign.recipientsCount} destinataire(s)</span>
        <span>{formatDate(campaign.scheduledAt)}</span>
      </div>

      {campaign.errorMessage ? (
        <small className="pipeline-card-error">{campaign.errorMessage}</small>
      ) : null}
    </article>
  )
}
