import {
  FolderPlus,
  Layers3,
  RefreshCw,
  Search,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../../../lib/apiClient'
import { useConfirmDialog } from '../../../shared/confirm/ConfirmDialogProvider'
import { Pagination } from '../../../shared/pagination/Pagination'
import { usePagination } from '../../../shared/pagination/usePagination'
import { useAuth } from '../../auth/AuthProvider'
import { fetchContacts } from '../../contacts/api/contactsApi'
import type { Contact } from '../../contacts/types/contactTypes'
import {
  addContactToList,
  createContactList,
  deleteContactList,
  fetchContactList,
  fetchContactLists,
  removeContactFromList,
  updateContactList,
} from '../api/contactListsApi'
import { ContactListDetailsPanel } from '../components/ContactListDetailsPanel'
import { ContactListFormPanel } from '../components/ContactListFormPanel'
import { ContactListsGrid } from '../components/ContactListsGrid'
import type {
  ContactList,
  ContactListPayload,
  ContactListWithContacts,
} from '../types/contactListTypes'

export function ContactListsPage() {
  const { token } = useAuth()
  const { confirm } = useConfirmDialog()
  const [contactLists, setContactLists] = useState<ContactList[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedList, setSelectedList] =
    useState<ContactListWithContacts | null>(null)
  const [editingList, setEditingList] = useState<ContactList | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [query, setQuery] = useState('')

  const loadData = useCallback(async () => {
    if (!token) {
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const [listsResponse, contactsResponse] = await Promise.all([
        fetchContactLists(token),
        fetchContacts(token),
      ])
      setContactLists(listsResponse.data)
      setContacts(contactsResponse.data)
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : 'Impossible de charger les listes de contacts.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const stats = useMemo(() => {
    const activeContacts = contacts.filter(
      (contact) => contact.status === 'active',
    ).length
    const assignedContacts = contactLists.reduce(
      (total, contactList) => total + contactList.contactsCount,
      0,
    )

    return {
      totalLists: contactLists.length,
      activeContacts,
      assignedContacts,
    }
  }, [contactLists, contacts])

  const visibleLists = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return contactLists.filter((contactList) =>
      [contactList.name, contactList.description ?? '']
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    )
  }, [contactLists, query])

  const listsPagination = usePagination(visibleLists)

  async function handleSelect(contactList: ContactList) {
    if (!token) {
      return
    }

    setError(null)

    try {
      const { data } = await fetchContactList(token, contactList.id)
      setSelectedList(data)
    } catch (selectError) {
      setError(
        selectError instanceof ApiError
          ? selectError.message
          : 'Impossible de charger cette liste.',
      )
    }
  }

  async function handleSubmit(payload: ContactListPayload) {
    if (!token) {
      return
    }

    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      if (editingList) {
        const { data } = await updateContactList(token, editingList.id, payload)
        setContactLists((current) =>
          current.map((contactList) =>
            contactList.id === data.id ? data : contactList,
          ),
        )
        setSelectedList(data)
        setSuccess('Liste mise à jour.')
      } else {
        const { data } = await createContactList(token, payload)
        setContactLists((current) => [data, ...current])
        setSelectedList(data)
        setSuccess('Liste créée. Vous pouvez maintenant y ajouter des contacts.')
      }

      setEditingList(null)
      setIsFormModalOpen(false)
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : 'Impossible d’enregistrer cette liste.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(contactList: ContactList) {
    if (!token) {
      return
    }

    const shouldDelete = await confirm({
      title: 'Supprimer cette liste ?',
      description: `La liste « ${contactList.name} » sera supprimée. Les contacts resteront dans votre base.`,
      confirmLabel: 'Supprimer',
      variant: 'danger',
    })

    if (!shouldDelete) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      await deleteContactList(token, contactList.id)
      setContactLists((current) =>
        current.filter((candidate) => candidate.id !== contactList.id),
      )
      if (selectedList?.id === contactList.id) {
        setSelectedList(null)
      }
      setSuccess('Liste supprimée.')
    } catch (deleteError) {
      setError(
        deleteError instanceof ApiError
          ? deleteError.message
          : 'Impossible de supprimer cette liste.',
      )
    }
  }

  async function handleAddContact(contact: Contact) {
    if (!token || !selectedList) {
      return
    }

    setError(null)
    setSuccess(null)
    setIsBusy(true)

    try {
      const { data } = await addContactToList(token, selectedList.id, contact.id)
      setSelectedList(data)
      syncListCount(data)
      setSuccess(`${contact.fullName || contact.email} ajouté à la liste.`)
    } catch (addError) {
      setError(
        addError instanceof ApiError
          ? addError.message
          : 'Impossible d’ajouter ce contact.',
      )
    } finally {
      setIsBusy(false)
    }
  }

  async function handleRemoveContact(contact: Contact) {
    if (!token || !selectedList) {
      return
    }

    setError(null)
    setSuccess(null)
    setIsBusy(true)

    try {
      await removeContactFromList(token, selectedList.id, contact.id)
      const { data } = await fetchContactList(token, selectedList.id)
      setSelectedList(data)
      syncListCount(data)
      setSuccess(`${contact.fullName || contact.email} retiré de la liste.`)
    } catch (removeError) {
      setError(
        removeError instanceof ApiError
          ? removeError.message
          : 'Impossible de retirer ce contact.',
      )
    } finally {
      setIsBusy(false)
    }
  }

  function syncListCount(contactList: ContactListWithContacts) {
    setContactLists((current) =>
      current.map((candidate) =>
        candidate.id === contactList.id ? contactList : candidate,
      ),
    )
  }

  function openCreateModal() {
    setEditingList(null)
    setIsFormModalOpen(true)
    setError(null)
    setSuccess(null)
  }

  function openEditModal(contactList: ContactList) {
    setEditingList(contactList)
    setIsFormModalOpen(true)
    setError(null)
    setSuccess(null)
  }

  function closeFormModal() {
    setIsFormModalOpen(false)
    setEditingList(null)
  }

  return (
    <div className="contact-lists-page">
      <section className="page-hero compact-hero">
        <div>
          <p className="eyebrow">Catégories de contacts</p>
          <h1>Catégorisez vos audiences avant chaque campagne.</h1>
          <p className="muted">
            Créez des segments propres, ajoutez les bons contacts et sélectionnez
            ensuite la liste ciblée lors de la création d’une campagne.
          </p>
        </div>
        <div className="hero-actions">
          <button className="secondary-button" onClick={openCreateModal} type="button">
            <FolderPlus size={18} />
            Nouvelle liste
          </button>
          <button className="secondary-button" onClick={loadData} type="button">
            <RefreshCw size={18} />
            Actualiser
          </button>
        </div>
      </section>

      <section className="insight-grid">
        <div className="insight-card">
          <Layers3 size={20} />
          <span>Listes</span>
          <strong>{stats.totalLists}</strong>
        </div>
        <div className="insight-card">
          <ShieldCheck size={20} />
          <span>Contacts actifs</span>
          <strong>{stats.activeContacts}</strong>
        </div>
        <div className="insight-card">
          <UsersRound size={20} />
          <span>Affectations</span>
          <strong>{stats.assignedContacts}</strong>
        </div>
      </section>

      <section className="contact-lists-workbench">
        <div className="contact-lists-main-panel">
          {error ? <div className="form-alert">{error}</div> : null}
          {success ? <div className="success-alert">{success}</div> : null}

          <div className="toolbar">
            <label className="search-shell">
              <Search size={18} />
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher une liste..."
                value={query}
              />
            </label>
          </div>

          {isLoading ? (
            <div className="loading-state">Chargement des listes...</div>
          ) : (
            <ContactListsGrid
              contactLists={listsPagination.paginatedItems}
              onDelete={handleDelete}
              onEdit={openEditModal}
              onSelect={handleSelect}
              selectedId={selectedList?.id ?? null}
            />
          )}

          <Pagination
            currentPage={listsPagination.currentPage}
            endItem={listsPagination.endItem}
            onPageChange={listsPagination.setCurrentPage}
            startItem={listsPagination.startItem}
            totalItems={listsPagination.totalItems}
            totalPages={listsPagination.totalPages}
          />
        </div>

        <ContactListDetailsPanel
          allContacts={contacts}
          contactList={selectedList}
          isBusy={isBusy}
          onAddContact={handleAddContact}
          onRemoveContact={handleRemoveContact}
        />
      </section>

      {isFormModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section
            aria-label="Formulaire liste de contacts"
            className="modal-panel contact-list-form-modal"
            role="dialog"
          >
            <button
              aria-label="Fermer le formulaire"
              className="icon-button soft modal-close-button"
              onClick={closeFormModal}
              type="button"
            >
              <X size={18} />
            </button>
            <ContactListFormPanel
              contactList={editingList}
              isSubmitting={isSubmitting}
              onCancel={closeFormModal}
              onSubmit={handleSubmit}
            />
          </section>
        </div>
      ) : null}
    </div>
  )
}
