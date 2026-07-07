import {
  Ban,
  Edit3,
  Eye,
  Rocket,
  Send,
  Trash2,
} from 'lucide-react'
import { CampaignStatusBadge } from './CampaignStatusBadge'
import type { Campaign } from '../types/campaignTypes'

type CampaignsTableProps = {
  campaigns: Campaign[]
  onCancel: (campaign: Campaign) => void
  onDelete: (campaign: Campaign) => void
  onEdit: (campaign: Campaign) => void
  onPrepare: (campaign: Campaign) => void
  onSelect: (campaign: Campaign) => void
  onSend: (campaign: Campaign) => void
}

export function CampaignsTable({
  campaigns,
  onCancel,
  onDelete,
  onEdit,
  onPrepare,
  onSelect,
  onSend,
}: CampaignsTableProps) {
  if (campaigns.length === 0) {
    return (
      <div className="empty-state">
        <strong>Aucune campagne</strong>
        <span>Créez votre première campagne pour préparer vos envois.</span>
      </div>
    )
  }

  return (
    <div className="table-shell">
      <table className="data-table">
        <thead>
          <tr>
            <th>Campagne</th>
            <th>Statut</th>
            <th>Destinataires</th>
            <th>Planification</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id}>
              <td>
                <div className="campaign-identity">
                  <strong>{campaign.name}</strong>
                  <span>{campaign.subject}</span>
                </div>
              </td>
              <td>
                <CampaignStatusBadge status={campaign.status} />
              </td>
              <td>{campaign.recipientsCount}</td>
              <td>{formatDate(campaign.scheduledAt ?? campaign.sentAt)}</td>
              <td>
                <div className="row-actions">
                  <button
                    className="icon-button soft"
                    onClick={() => onSelect(campaign)}
                    title="Détails"
                    type="button"
                  >
                    <Eye size={17} />
                  </button>
                  <button
                    className="icon-button soft"
                    onClick={() => onPrepare(campaign)}
                    title="Préparer"
                    type="button"
                  >
                    <Rocket size={17} />
                  </button>
                  <button
                    className="icon-button soft"
                    onClick={() => onSend(campaign)}
                    title="Envoyer"
                    type="button"
                  >
                    <Send size={17} />
                  </button>
                  <button
                    className="icon-button soft"
                    onClick={() => onEdit(campaign)}
                    title="Modifier"
                    type="button"
                  >
                    <Edit3 size={17} />
                  </button>
                  <button
                    className="icon-button soft"
                    onClick={() => onCancel(campaign)}
                    title="Annuler"
                    type="button"
                  >
                    <Ban size={17} />
                  </button>
                  <button
                    className="icon-button danger"
                    onClick={() => onDelete(campaign)}
                    title="Supprimer"
                    type="button"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Non planifiée'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
