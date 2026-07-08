import {
  Download,
  FileSpreadsheet,
  RefreshCw,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../../../lib/apiClient'
import { useConfirmDialog } from '../../../shared/confirm/ConfirmDialogProvider'
import { Pagination } from '../../../shared/pagination/Pagination'
import { usePagination } from '../../../shared/pagination/usePagination'
import { useAuth } from '../../auth/AuthProvider'
import { fetchCountries } from '../../locations/api/locationsApi'
import type { Country } from '../../locations/types/locationTypes'
import {
  createContact,
  deleteContact,
  fetchContacts,
  importContactsFile,
  updateContact,
} from '../api/contactsApi'
import { ContactFormPanel } from '../components/ContactFormPanel'
import { ContactImportReportModal } from '../components/ContactImportReportModal'
import { ContactsTable } from '../components/ContactsTable'
import {
  downloadContactsCsvTemplate,
  downloadContactsExcelTemplate,
  downloadContactsTestCsvFile,
} from '../utils/contactFileTemplates'
import type {
  Contact,
  ContactImport,
  ContactPayload,
  ContactStatus,
} from '../types/contactTypes'

const filterOptions: Array<{ label: string; value: ContactStatus | 'all' }> = [
  { label: 'Tous', value: 'all' },
  { label: 'Actifs', value: 'active' },
  { label: 'Invalides', value: 'invalid' },
  { label: 'Bounces', value: 'bounced' },
  { label: 'Désabonnés', value: 'unsubscribed' },
]

export function ContactsPage() {
  const { token } = useAuth()
  const { confirm } = useConfirmDialog()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isImportReportOpen, setIsImportReportOpen] = useState(false)
  const [importReport, setImportReport] = useState<ContactImport | null>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all')

  const loadContacts = useCallback(async () => {
    if (!token) {
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const { data } = await fetchContacts(token)
      setContacts(data)
    } catch (fetchError) {
      setError(
        fetchError instanceof ApiError
          ? fetchError.message
          : 'Impossible de charger les contacts.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [token])

  const loadCountries = useCallback(async () => {
    if (!token) return

    try {
      const { data } = await fetchCountries(token)
      setCountries(data)
    } catch {
      setCountries([])
    }
  }, [token])

  useEffect(() => {
    void loadContacts()
    void loadCountries()
  }, [loadContacts, loadCountries])

  const stats = useMemo(() => {
    const active = contacts.filter((contact) => contact.status === 'active').length
    const blocked = contacts.length - active

    return {
      total: contacts.length,
      active,
      blocked,
    }
  }, [contacts])

  const visibleContacts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return contacts.filter((contact) => {
      const matchesStatus =
        statusFilter === 'all' ? true : contact.status === statusFilter
      const searchable = [
        contact.email,
        contact.fullName ?? '',
        contact.mobileNumber ?? '',
        contact.commune ?? '',
        contact.country ?? '',
      ]
        .join(' ')
        .toLowerCase()
      return matchesStatus && searchable.includes(normalizedQuery)
    })
  }, [contacts, query, statusFilter])

  const contactsPagination = usePagination(visibleContacts)

  async function handleSubmit(payload: ContactPayload) {
    if (!token) {
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      if (editingContact) {
        const { data } = await updateContact(token, editingContact.id, payload)
        setContacts((current) =>
          current.map((contact) => (contact.id === data.id ? data : contact)),
        )
        setEditingContact(null)
        setIsFormModalOpen(false)
      } else {
        const { data } = await createContact(token, payload)
        setContacts((current) => [data, ...current])
        setIsFormModalOpen(false)
      }
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : 'Impossible d’enregistrer ce contact.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(contact: Contact) {
    if (!token) {
      return
    }

    const shouldDelete = await confirm({
      title: 'Supprimer ce contact ?',
      description: `${contact.fullName ?? contact.email} sera retiré de votre base. Cette action est définitive.`,
      confirmLabel: 'Supprimer',
      variant: 'danger',
    })

    if (!shouldDelete) {
      return
    }

    setError(null)

    try {
      await deleteContact(token, contact.id)
      setContacts((current) =>
        current.filter((candidate) => candidate.id !== contact.id),
      )
      if (editingContact?.id === contact.id) {
        setEditingContact(null)
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof ApiError
          ? deleteError.message
          : 'Impossible de supprimer ce contact.',
      )
    }
  }

  async function handleImport(file: File | null) {
    if (!token || !file) {
      return
    }

    if (isTemplateFile(file)) {
      setError(
        'Vous avez sélectionné le fichier modèle. Il sert uniquement de structure. Pour le test, cliquez sur « Test 50 contacts », puis importez le fichier « top-teaser-test-50-contacts.csv ».',
      )
      setImportMessage(null)
      setImportReport(null)
      setIsImportReportOpen(false)
      return
    }

    setError(null)
    setImportMessage(null)
    setImportReport(null)
    setIsImportReportOpen(true)
    setIsImporting(true)

    try {
      const { data } = await importContactsFile(token, file)
      setImportReport(data)
      setImportMessage(
        `${data.importedRows} importé(s), ${data.duplicateRows} doublon(s), ${data.invalidRows} erreur(s) sur ${data.totalRows} ligne(s).`,
      )
      await loadContacts()
    } catch (importError) {
      setIsImportReportOpen(false)
      setError(
        importError instanceof ApiError
          ? importError.message
          : 'Impossible d’importer ce fichier.',
      )
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="contacts-page">
      <section className="page-hero compact-hero">
        <div>
          <p className="eyebrow">Contacts</p>
          <h1>Audience propre, segmentation fluide.</h1>
          <p className="muted">
            Centralisez vos contacts, surveillez la qualité des emails et gardez
            une base saine avant chaque campagne.
          </p>
        </div>
        <div className="hero-actions">
          <button
            className="secondary-button"
            onClick={() => {
              setEditingContact(null)
              setIsFormModalOpen(true)
            }}
            type="button"
          >
            <UserPlus size={18} />
            Nouveau contact
          </button>
          <button
            className="secondary-button"
            onClick={downloadContactsCsvTemplate}
            type="button"
          >
            <Download size={18} />
            Modèle CSV
          </button>
          <button
            className="secondary-button"
            onClick={downloadContactsTestCsvFile}
            type="button"
          >
            <FileSpreadsheet size={18} />
            Test 50 contacts
          </button>
          <button
            className="secondary-button"
            onClick={downloadContactsExcelTemplate}
            type="button"
          >
            <Download size={18} />
            Modèle Excel
          </button>
          <label className="secondary-button file-button">
            <Download size={18} />
            {isImporting ? 'Import...' : 'Importer CSV/Excel'}
            <input
              accept=".csv,.xlsx"
              onChange={(event) => {
                void handleImport(event.target.files?.[0] ?? null)
                event.target.value = ''
              }}
              type="file"
            />
          </label>
          <button className="secondary-button" onClick={loadContacts} type="button">
            <RefreshCw size={18} />
            Actualiser
          </button>
        </div>
      </section>

      <section className="insight-grid">
        <div className="insight-card">
          <Users size={20} />
          <span>Total contacts</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="insight-card">
          <ShieldCheck size={20} />
          <span>Actifs</span>
          <strong>{stats.active}</strong>
        </div>
        <div className="insight-card">
          <Download size={20} />
          <span>À surveiller</span>
          <strong>{stats.blocked}</strong>
        </div>
      </section>

      <section className="contacts-workbench">
        <div className="contacts-main-panel">
          <div className="toolbar">
            <div className="search-shell">
              <Search size={18} />
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher par nom, mobile, email, commune ou pays"
                type="search"
                value={query}
              />
            </div>

            <div className="segmented-control">
              {filterOptions.map((option) => (
                <button
                  className={statusFilter === option.value ? 'active' : ''}
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {error ? <div className="form-alert">{error}</div> : null}
          {importMessage ? (
            <div className="success-alert import-success-alert">
              <span>{importMessage}</span>
              {importReport ? (
                <button
                  className="inline-action-button"
                  onClick={() => setIsImportReportOpen(true)}
                  type="button"
                >
                  <FileSpreadsheet size={16} />
                  Voir le rapport
                </button>
              ) : null}
            </div>
          ) : null}

          {isLoading ? (
            <div className="loading-state">Chargement des contacts...</div>
          ) : (
            <ContactsTable
              contacts={contactsPagination.paginatedItems}
              onDelete={handleDelete}
              onEdit={(contact) => {
                setEditingContact(contact)
                setIsFormModalOpen(true)
              }}
            />
          )}

          <Pagination
            currentPage={contactsPagination.currentPage}
            endItem={contactsPagination.endItem}
            onPageChange={contactsPagination.setCurrentPage}
            startItem={contactsPagination.startItem}
            totalItems={contactsPagination.totalItems}
            totalPages={contactsPagination.totalPages}
          />
        </div>
      </section>

      {isFormModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section
            aria-label="Formulaire contact"
            className="modal-panel contact-form-modal"
            role="dialog"
          >
            <button
              aria-label="Fermer le formulaire"
              className="icon-button soft modal-close-button"
              onClick={() => {
                setIsFormModalOpen(false)
                setEditingContact(null)
              }}
              type="button"
            >
              <X size={18} />
            </button>
            <ContactFormPanel
              contact={editingContact}
              countries={countries}
              isSubmitting={isSubmitting}
              onCancel={() => {
                setEditingContact(null)
                setIsFormModalOpen(false)
              }}
              onSubmit={handleSubmit}
            />
          </section>
        </div>
      ) : null}

      <ContactImportReportModal
        importReport={isImportReportOpen ? importReport : null}
        isImporting={isImporting}
        onClose={() => setIsImportReportOpen(false)}
      />

      <button
        className="floating-action"
        onClick={() => {
          setEditingContact(null)
          setIsFormModalOpen(true)
        }}
        type="button"
      >
        <UserPlus size={20} />
        Nouveau contact
      </button>
    </div>
  )
}

function isTemplateFile(file: File) {
  const filename = file.name.toLowerCase()

  return filename.startsWith('modele-contacts')
}
