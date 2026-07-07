import { Eye } from 'lucide-react'
import { EmailLogStatusBadge } from './EmailLogStatusBadge'
import type { EmailLog } from '../types/emailLogTypes'

type EmailLogsTableProps = {
  logs: EmailLog[]
  onSelect: (log: EmailLog) => void
}

export function EmailLogsTable({ logs, onSelect }: EmailLogsTableProps) {
  if (logs.length === 0) {
    return (
      <div className="empty-state">
        <strong>Aucun log</strong>
        <span>Les envois préparés ou envoyés apparaîtront ici.</span>
      </div>
    )
  }

  return (
    <div className="table-shell">
      <table className="data-table">
        <thead>
          <tr>
            <th>Destinataire</th>
            <th>Campagne</th>
            <th>Statut</th>
            <th>Provider ID</th>
            <th>Date</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>
                <div className="log-recipient">
                  <strong>{log.email}</strong>
                  <span>Contact #{log.contactId}</span>
                </div>
              </td>
              <td>
                <div className="log-campaign">
                  <strong>{log.campaignName}</strong>
                  <span>Campagne #{log.campaignId}</span>
                </div>
              </td>
              <td>
                <EmailLogStatusBadge status={log.status} />
              </td>
              <td className="mono-cell">{log.providerMessageId ?? '—'}</td>
              <td>{formatDate(log.sentAt ?? log.createdAt)}</td>
              <td>
                <div className="row-actions">
                  <button
                    className="icon-button soft"
                    onClick={() => onSelect(log)}
                    title="Voir le détail"
                    type="button"
                  >
                    <Eye size={17} />
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
