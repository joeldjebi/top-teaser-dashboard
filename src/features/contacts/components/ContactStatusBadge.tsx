import type { ContactStatus } from '../types/contactTypes'

const statusLabels: Record<ContactStatus, string> = {
  active: 'Actif',
  invalid: 'Invalide',
  bounced: 'Bounce',
  unsubscribed: 'Désabonné',
}

export function ContactStatusBadge({ status }: { status: ContactStatus }) {
  return (
    <span className={`status-badge status-${status}`}>
      {statusLabels[status]}
    </span>
  )
}
