import type { CampaignRecipientStatus } from '../../campaigns/types/campaignTypes'

const statusLabels: Record<CampaignRecipientStatus, string> = {
  pending: 'En attente',
  sent: 'Envoyé',
  failed: 'Échec',
  bounced: 'Bounce',
  opened: 'Ouvert',
  clicked: 'Cliqué',
  unsubscribed: 'Désabonné',
}

export function EmailLogStatusBadge({
  status,
}: {
  status: CampaignRecipientStatus
}) {
  return (
    <span className={`status-badge email-log-status-${status}`}>
      {statusLabels[status]}
    </span>
  )
}
