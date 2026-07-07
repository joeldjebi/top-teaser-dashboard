import { AlertCircle, MailCheck, RefreshCw } from 'lucide-react'
import { Pagination } from '../../../shared/pagination/Pagination'
import { usePagination } from '../../../shared/pagination/usePagination'
import type {
  Campaign,
  CampaignRecipient,
  CampaignStats,
} from '../types/campaignTypes'

type CampaignDetailsPanelProps = {
  campaign: Campaign | null
  isSyncingBulkStatus?: boolean
  onSyncBulkStatus?: (campaign: Campaign) => void
  recipients: CampaignRecipient[]
  stats: CampaignStats | null
}

export function CampaignDetailsPanel({
  campaign,
  isSyncingBulkStatus = false,
  onSyncBulkStatus,
  recipients,
  stats,
}: CampaignDetailsPanelProps) {
  const recipientsPagination = usePagination(recipients)

  if (!campaign) {
    return (
      <section className="campaign-details-panel empty-details">
        <MailCheck size={24} />
        <strong>Sélectionnez une campagne</strong>
        <span>Les statistiques et les destinataires s’afficheront ici.</span>
      </section>
    )
  }

  const metrics = [
    ['Total', stats?.total ?? campaign.recipientsCount],
    ['Envoyés', stats?.sent ?? 0],
    ['Ouverts', stats?.opened ?? 0],
    ['Cliqués', stats?.clicked ?? 0],
    ['Échecs', stats?.failed ?? 0],
    ['Désabonnés', stats?.unsubscribed ?? 0],
  ]

  return (
    <section className="campaign-details-panel">
      <div>
        <p className="eyebrow">Détails</p>
        <h2>{campaign.name}</h2>
      </div>

      {campaign.sendMode === 'bulk' && campaign.status === 'sending' ? (
        <div className="bulk-status-sync">
          <div>
            <strong>Suivi Bulk Postmark</strong>
            <span>
              La requête est en cours de traitement chez Postmark. Synchronisez
              pour récupérer l’état réel.
            </span>
          </div>
          <button
            className="secondary-button"
            disabled={isSyncingBulkStatus}
            onClick={() => onSyncBulkStatus?.(campaign)}
            type="button"
          >
            <RefreshCw size={16} />
            {isSyncingBulkStatus ? 'Synchronisation...' : 'Synchroniser'}
          </button>
        </div>
      ) : null}

      {campaign.status === 'failed' && campaign.errorMessage && (
        <div className="error-alert">
          <div className="error-alert-header">
            <AlertCircle size={18} />
            <strong>Erreur d'envoi</strong>
          </div>
          <p className="error-alert-message">{campaign.errorMessage}</p>
        </div>
      )}

      <div className="campaign-metric-grid">
        {metrics.map(([label, value]) => (
          <div className="campaign-mini-metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="recipient-list">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Destinataires</p>
            <h2>Suivi d’envoi</h2>
          </div>
        </div>

        {recipients.length === 0 ? (
          <div className="empty-state compact-empty">
            <strong>Aucun destinataire préparé</strong>
            <span>Lancez la préparation pour générer la liste d’envoi.</span>
          </div>
        ) : (
          <div className="paginated-list">
            <div className="recipient-page-list">
              {recipientsPagination.paginatedItems.map((recipient) => (
                <div className="recipient-row" key={recipient.id}>
                  <div>
                    <strong>
                      {recipient.contact.fullName || recipient.contact.email}
                    </strong>
                    <span>{recipient.contact.email}</span>
                    {recipient.errorMessage ? (
                      <small className="recipient-error-message">
                        {recipient.errorMessage}
                      </small>
                    ) : null}
                  </div>
                  <span className="recipient-status">{recipient.status}</span>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={recipientsPagination.currentPage}
              endItem={recipientsPagination.endItem}
              onPageChange={recipientsPagination.setCurrentPage}
              startItem={recipientsPagination.startItem}
              totalItems={recipientsPagination.totalItems}
              totalPages={recipientsPagination.totalPages}
            />
          </div>
        )}
      </div>
    </section>
  )
}
