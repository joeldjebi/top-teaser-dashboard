import { Activity, AlertTriangle, MailCheck } from 'lucide-react'
import { EmailLogStatusBadge } from './EmailLogStatusBadge'
import type { EmailLog } from '../types/emailLogTypes'

type EmailLogDetailsPanelProps = {
  log: EmailLog | null
}

export function EmailLogDetailsPanel({ log }: EmailLogDetailsPanelProps) {
  if (!log) {
    return (
      <aside className="email-log-details-panel empty-details">
        <Activity size={24} />
        <strong>Sélectionnez un log</strong>
        <span>Le détail technique de l’envoi s’affichera ici.</span>
      </aside>
    )
  }

  return (
    <aside className="email-log-details-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Log d’envoi</p>
          <h2>{log.email}</h2>
        </div>
        <EmailLogStatusBadge status={log.status} />
      </div>

      <div className="log-detail-stack">
        <DetailRow label="Campagne" value={log.campaignName} />
        <DetailRow label="ID campagne" value={`#${log.campaignId}`} />
        <DetailRow label="ID contact" value={`#${log.contactId}`} />
        <DetailRow
          label="Message provider"
          value={log.providerMessageId ?? 'Non disponible'}
          mono
        />
        <DetailRow label="Créé le" value={formatDate(log.createdAt)} />
        <DetailRow
          label="Envoyé le"
          value={log.sentAt ? formatDate(log.sentAt) : 'Non envoyé'}
        />
        <DetailRow label="Mis à jour le" value={formatDate(log.updatedAt)} />
      </div>

      {log.errorMessage ? (
        <div className="log-error-box">
          <AlertTriangle size={18} />
          <span>{log.errorMessage}</span>
        </div>
      ) : (
        <div className="log-success-box">
          <MailCheck size={18} />
          <span>Aucune erreur enregistrée pour ce log.</span>
        </div>
      )}
    </aside>
  )
}

function DetailRow({
  label,
  mono = false,
  value,
}: {
  label: string
  mono?: boolean
  value: string
}) {
  return (
    <div className="log-detail-row">
      <span>{label}</span>
      <strong className={mono ? 'mono-cell' : ''}>{value}</strong>
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
