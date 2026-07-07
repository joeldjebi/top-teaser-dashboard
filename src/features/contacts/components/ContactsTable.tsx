import { Edit3, Trash2 } from 'lucide-react'
import { ContactStatusBadge } from './ContactStatusBadge'
import type { Contact } from '../types/contactTypes'

type ContactsTableProps = {
  contacts: Contact[]
  onDelete: (contact: Contact) => void
  onEdit: (contact: Contact) => void
}

export function ContactsTable({
  contacts,
  onDelete,
  onEdit,
}: ContactsTableProps) {
  if (contacts.length === 0) {
    return (
      <div className="empty-state">
        <strong>Aucun contact trouve</strong>
        <span>Ajoutez un contact ou ajustez vos filtres.</span>
      </div>
    )
  }

  return (
    <div className="table-shell">
      <table className="data-table">
        <thead>
          <tr>
            <th>Contact</th>
            <th>Mobile</th>
            <th>Commune</th>
            <th>Pays</th>
            <th>Statut</th>
            <th>Ajouté le</th>
            <th aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>
                <div className="contact-identity">
                  <span className="avatar">{getInitials(contact)}</span>
                  <div>
                    <strong>{getDisplayName(contact)}</strong>
                    <span>{contact.email}</span>
                  </div>
                </div>
              </td>
              <td>{contact.mobileNumber ?? '—'}</td>
              <td>{contact.commune ?? '—'}</td>
              <td>{contact.country ?? '—'}</td>
              <td>
                <ContactStatusBadge status={contact.status} />
              </td>
              <td>{formatDate(contact.createdAt)}</td>
              <td>
                <div className="row-actions">
                  <button
                    aria-label="Modifier le contact"
                    className="icon-button soft"
                    onClick={() => onEdit(contact)}
                    type="button"
                  >
                    <Edit3 size={17} />
                  </button>
                  <button
                    aria-label="Supprimer le contact"
                    className="icon-button danger"
                    onClick={() => onDelete(contact)}
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

function getDisplayName(contact: Contact) {
  return contact.fullName || 'Sans nom'
}

function getInitials(contact: Contact) {
  const name = getDisplayName(contact)

  if (name === 'Sans nom') {
    return contact.email.slice(0, 2).toUpperCase()
  }

  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}
