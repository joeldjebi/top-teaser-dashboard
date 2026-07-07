import { Edit3, Trash2, UsersRound } from 'lucide-react'
import type { ContactList } from '../types/contactListTypes'

type ContactListsGridProps = {
  contactLists: ContactList[]
  onDelete: (contactList: ContactList) => void
  onEdit: (contactList: ContactList) => void
  onSelect: (contactList: ContactList) => void
  selectedId: number | null
}

export function ContactListsGrid({
  contactLists,
  onDelete,
  onEdit,
  onSelect,
  selectedId,
}: ContactListsGridProps) {
  if (contactLists.length === 0) {
    return (
      <div className="empty-state">
        <strong>Aucune liste</strong>
        <span>Créez une catégorie pour segmenter vos campagnes.</span>
      </div>
    )
  }

  return (
    <div className="contact-lists-grid">
      {contactLists.map((contactList) => (
        <article
          className={`contact-list-card ${
            selectedId === contactList.id ? 'active' : ''
          }`}
          key={contactList.id}
        >
          <div className="contact-list-card-header">
            <div className="contact-list-icon">
              <UsersRound size={20} />
            </div>
            <strong>{contactList.contactsCount}</strong>
          </div>

          <div>
            <p className="eyebrow">Catégorie</p>
            <h3>{contactList.name}</h3>
            <p>{contactList.description || 'Aucune description renseignée.'}</p>
          </div>

          <div className="contact-list-card-actions">
            <button
              className="secondary-button compact-action-button"
              onClick={() => onSelect(contactList)}
              type="button"
            >
              <UsersRound size={16} />
              Gérer les contacts
            </button>
            <button
              className="secondary-button compact-action-button"
              onClick={() => onEdit(contactList)}
              type="button"
            >
              <Edit3 size={16} />
              Modifier
            </button>
            <button
              className="secondary-button compact-action-button danger"
              onClick={() => onDelete(contactList)}
              type="button"
            >
              <Trash2 size={16} />
              Supprimer
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
