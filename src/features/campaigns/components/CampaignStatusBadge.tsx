import type { CampaignStatus } from '../types/campaignTypes'

const statusLabels: Record<CampaignStatus, string> = {
  draft: 'Brouillon',
  ready: 'Prête',
  sending: 'En cours',
  sent: 'Envoyée',
  failed: 'Échec',
  cancelled: 'Annulée',
}

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span className={`status-badge campaign-status-${status}`}>
      {statusLabels[status]}
    </span>
  )
}
