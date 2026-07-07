import { Plus, Search, UserMinus, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Pagination } from '../../../shared/pagination/Pagination'
import { usePagination } from '../../../shared/pagination/usePagination'
import { ContactStatusBadge } from '../../contacts/components/ContactStatusBadge'
import type { Contact } from '../../contacts/types/contactTypes'
import type { ContactListWithContacts } from '../types/contactListTypes'

type ContactListDetailsPanelProps = {
  allContacts: Contact[]
  contactList: ContactListWithContacts | null
  isBusy: boolean
  onAddContact: (contact: Contact) => void
  onRemoveContact: (contact: Contact) => void
}

export function ContactListDetailsPanel({
  allContacts,
  contactList,
  isBusy,
  onAddContact,
  onRemoveContact,
}: ContactListDetailsPanelProps) {
  const [memberQuery, setMemberQuery] = useState('')
  const [availableQuery, setAvailableQuery] = useState('')

  const memberIds = useMemo(
    () => new Set(contactList?.contacts.map((contact) => contact.id) ?? []),
    [contactList],
  )

  const visibleMembers = useMemo(() => {
    const query = memberQuery.trim().toLowerCase()

    return (contactList?.contacts ?? []).filter((contact) =>
      buildSearchText(contact).includes(query),
    )
  }, [contactList, memberQuery])

  const availableContacts = useMemo(() => {
    const query = availableQuery.trim().toLowerCase()

    return allContacts.filter(
      (contact) =>
        contact.status === 'active' &&
        !memberIds.has(contact.id) &&
        buildSearchText(contact).includes(query),
    )
  }, [allContacts, availableQuery, memberIds])

  const membersPagination = usePagination(visibleMembers)
  const availablePagination = usePagination(availableContacts)

  if (!contactList) {
    return (
      <section className="contact-list-details-panel empty-details">
        <UsersRound size={24} />
        <strong>Sélectionnez une liste</strong>
        <span>
          Les contacts de la catégorie et les contacts disponibles apparaîtront
          ici.
        </span>
      </section>
    )
  }

  return (
    <section className="contact-list-details-panel">
      <div className="contact-list-details-header">
        <div>
          <p className="eyebrow">Catégorie active</p>
          <h2>{contactList.name}</h2>
          <p className="muted">
            {contactList.description || 'Aucune description renseignée.'}
          </p>
        </div>
        <span>{contactList.contactsCount} contact(s)</span>
      </div>

      <div className="contact-list-detail-grid">
        <div className="contact-list-member-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Dans la liste</p>
              <h2>Contacts ciblés</h2>
            </div>
          </div>
          <label className="search-shell">
            <Search size={18} />
            <input
              onChange={(event) => setMemberQuery(event.target.value)}
              placeholder="Rechercher dans la liste..."
              value={memberQuery}
            />
          </label>

          <ContactRows
            action="remove"
            contacts={membersPagination.paginatedItems}
            disabled={isBusy}
            emptyLabel="Aucun contact dans cette catégorie."
            onAction={onRemoveContact}
          />

          <Pagination
            currentPage={membersPagination.currentPage}
            endItem={membersPagination.endItem}
            onPageChange={membersPagination.setCurrentPage}
            startItem={membersPagination.startItem}
            totalItems={membersPagination.totalItems}
            totalPages={membersPagination.totalPages}
          />
        </div>

        <div className="contact-list-member-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Disponibles</p>
              <h2>Ajouter à la liste</h2>
            </div>
          </div>
          <label className="search-shell">
            <Search size={18} />
            <input
              onChange={(event) => setAvailableQuery(event.target.value)}
              placeholder="Nom, email, mobile, commune..."
              value={availableQuery}
            />
          </label>

          <ContactRows
            action="add"
            contacts={availablePagination.paginatedItems}
            disabled={isBusy}
            emptyLabel="Aucun contact actif disponible."
            onAction={onAddContact}
          />

          <Pagination
            currentPage={availablePagination.currentPage}
            endItem={availablePagination.endItem}
            onPageChange={availablePagination.setCurrentPage}
            startItem={availablePagination.startItem}
            totalItems={availablePagination.totalItems}
            totalPages={availablePagination.totalPages}
          />
        </div>
      </div>
    </section>
  )
}

function ContactRows({
  action,
  contacts,
  disabled,
  emptyLabel,
  onAction,
}: {
  action: 'add' | 'remove'
  contacts: Contact[]
  disabled: boolean
  emptyLabel: string
  onAction: (contact: Contact) => void
}) {
  if (contacts.length === 0) {
    return (
      <div className="empty-state compact-empty">
        <strong>{emptyLabel}</strong>
        <span>Ajustez votre recherche ou ajoutez de nouveaux contacts.</span>
      </div>
    )
  }

  return (
    <div className="contact-list-contact-rows">
      {contacts.map((contact) => (
        <article className="contact-list-contact-row" key={contact.id}>
          <div>
            <strong>{contact.fullName || 'Sans nom'}</strong>
            <span>{contact.email}</span>
            <small>
              {[contact.mobileNumber, contact.commune, contact.country]
                .filter(Boolean)
                .join(' · ') || 'Aucune information complémentaire'}
            </small>
          </div>
          <div className="contact-list-row-actions">
            <ContactStatusBadge status={contact.status} />
            <button
              className={
                action === 'add'
                  ? 'secondary-button compact-action-button'
                  : 'secondary-button compact-action-button danger'
              }
              disabled={disabled}
              onClick={() => onAction(contact)}
              type="button"
            >
              {action === 'add' ? <Plus size={17} /> : <UserMinus size={17} />}
              {action === 'add' ? 'Ajouter' : 'Retirer'}
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

function buildSearchText(contact: Contact) {
  return [
    contact.email,
    contact.fullName ?? '',
    contact.mobileNumber ?? '',
    contact.commune ?? '',
    contact.country ?? '',
  ]
    .join(' ')
    .toLowerCase()
}
