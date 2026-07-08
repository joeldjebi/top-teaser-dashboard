import type {
  Campaign,
  CampaignChannel,
  CampaignStatus,
} from '../../campaigns/types/campaignTypes'

const statusLabels: Record<CampaignStatus, string> = {
  cancelled: 'Annulées',
  draft: 'Brouillons',
  failed: 'Échouées',
  ready: 'En attente',
  sending: 'En cours',
  sent: 'Terminées',
}

const channelLabels: Record<CampaignChannel, string> = {
  email: 'Email',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
}

const statusOrder: CampaignStatus[] = [
  'draft',
  'ready',
  'sending',
  'sent',
  'failed',
  'cancelled',
]

const channelOrder: CampaignChannel[] = ['email', 'sms', 'whatsapp', 'telegram']

export function buildPipelineStatusData(campaigns: Campaign[]) {
  return statusOrder.map((status) => ({
    key: status,
    label: statusLabels[status],
    value: campaigns.filter((campaign) => campaign.status === status).length,
  }))
}

export function buildPipelineChannelData(campaigns: Campaign[]) {
  return channelOrder.map((channel) => ({
    key: channel,
    label: channelLabels[channel],
    value: campaigns.filter((campaign) =>
      campaign.channels?.some((item) => item.channel === channel),
    ).length,
  }))
}

export function PipelineStatusChart({
  items,
}: {
  items: Array<{ key: CampaignStatus; label: string; value: number }>
}) {
  const max = Math.max(...items.map((item) => item.value), 1)

  return (
    <div className="pipeline-status-chart">
      {items.map((item) => (
        <div className="pipeline-status-bar" key={item.key}>
          <div>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
          <div className="pipeline-status-track">
            <span
              className={item.key}
              style={{ width: `${Math.max((item.value / max) * 100, item.value ? 8 : 0)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function PipelineChannelChart({
  items,
}: {
  items: Array<{ key: CampaignChannel; label: string; value: number }>
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="pipeline-channel-chart">
      <div className="pipeline-channel-ring">
        <strong>{total}</strong>
        <span>canaux</span>
      </div>
      <div className="pipeline-channel-list">
        {items.map((item) => (
          <div key={item.key}>
            <span className={`channel-dot ${item.key}`} />
            <strong>{item.label}</strong>
            <small>{item.value}</small>
          </div>
        ))}
      </div>
    </div>
  )
}
