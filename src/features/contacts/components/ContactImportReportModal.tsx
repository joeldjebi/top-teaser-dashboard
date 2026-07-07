import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  X,
  XCircle,
} from 'lucide-react'
import { Pagination } from '../../../shared/pagination/Pagination'
import { usePagination } from '../../../shared/pagination/usePagination'
import type {
  ContactImport,
  ContactImportRowStatus,
  ContactImportSummaryRow,
} from '../types/contactTypes'

type ContactImportReportModalProps = {
  importReport: ContactImport | null
  isImporting: boolean
  onClose: () => void
}

const statusLabels: Record<ContactImportRowStatus, string> = {
  imported: 'Importée',
  duplicate: 'Doublon',
  invalid: 'Erreur',
}

const statusIcons = {
  imported: CheckCircle2,
  duplicate: AlertTriangle,
  invalid: XCircle,
}

export function ContactImportReportModal({
  importReport,
  isImporting,
  onClose,
}: ContactImportReportModalProps) {
  if (!isImporting && !importReport) {
    return null
  }

  const rows = importReport?.summary?.rows ?? []

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-label="Rapport d’import des contacts"
        className="modal-panel contact-import-report-modal"
        role="dialog"
      >
        {!isImporting ? (
          <button
            aria-label="Fermer le rapport"
            className="icon-button soft modal-close-button"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        ) : null}

        <div className="contact-import-report">
          <div className="contact-import-report-header">
            <div
              className={`contact-import-report-icon ${isImporting ? 'loading' : 'ready'}`}
            >
              {isImporting ? (
                <Loader2 size={24} />
              ) : (
                <FileSpreadsheet size={24} />
              )}
            </div>
            <div>
              <p className="eyebrow">Import contacts</p>
              <h2>
                {isImporting
                  ? 'Chargement et enregistrement en cours...'
                  : 'Rapport d’enregistrement'}
              </h2>
              <p className="muted">
                {isImporting
                  ? 'Le fichier est analysé, puis chaque ligne est contrôlée avant enregistrement.'
                  : `${importReport?.originalFilename ?? 'Fichier importé'} • ${formatDate(importReport?.createdAt)}`}
              </p>
            </div>
          </div>

          {isImporting ? (
            <div className="import-processing-state">
              <div className="progress-track indeterminate-progress">
                <span />
              </div>
              <div className="import-processing-steps">
                <span>Lecture du fichier</span>
                <span>Vérification des doublons</span>
                <span>Enregistrement des lignes valides</span>
              </div>
            </div>
          ) : (
            <>
              <div className="import-summary-grid">
                <SummaryCard
                  label="Lignes"
                  value={importReport?.totalRows ?? 0}
                  variant="neutral"
                />
                <SummaryCard
                  label="Importées"
                  value={importReport?.importedRows ?? 0}
                  variant="success"
                />
                <SummaryCard
                  label="Doublons"
                  value={importReport?.duplicateRows ?? 0}
                  variant="warning"
                />
                <SummaryCard
                  label="Erreurs"
                  value={importReport?.invalidRows ?? 0}
                  variant="danger"
                />
              </div>

              {importReport?.errorMessage ? (
                <div className="form-alert">{importReport.errorMessage}</div>
              ) : null}

              <ImportRowsTable rows={rows} />
            </>
          )}
        </div>
      </section>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  variant,
}: {
  label: string
  value: number
  variant: 'neutral' | 'success' | 'warning' | 'danger'
}) {
  return (
    <div className={`import-summary-card ${variant}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function ImportRowsTable({ rows }: { rows: ContactImportSummaryRow[] }) {
  const rowsPagination = usePagination(rows)

  if (rows.length === 0) {
    return (
      <div className="empty-state">
        <strong>Aucune ligne à afficher</strong>
        <span>Le rapport détaillé apparaîtra après l’import.</span>
      </div>
    )
  }

  return (
    <div className="paginated-list">
      <div className="table-shell import-report-table-shell">
        <table className="data-table import-report-table">
          <thead>
            <tr>
              <th>Ligne</th>
              <th>Email</th>
              <th>Résultat</th>
              <th>Détail</th>
            </tr>
          </thead>
          <tbody>
            {rowsPagination.paginatedItems.map((row) => (
              <tr key={`${row.rowNumber}-${row.email ?? 'empty'}`}>
                <td>#{row.rowNumber}</td>
                <td>{row.email ?? '—'}</td>
                <td>
                  <ImportRowStatusBadge status={row.status} />
                </td>
                <td>{translateReason(row.reason)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={rowsPagination.currentPage}
        endItem={rowsPagination.endItem}
        onPageChange={rowsPagination.setCurrentPage}
        startItem={rowsPagination.startItem}
        totalItems={rowsPagination.totalItems}
        totalPages={rowsPagination.totalPages}
      />
    </div>
  )
}

function ImportRowStatusBadge({ status }: { status: ContactImportRowStatus }) {
  const Icon = statusIcons[status]

  return (
    <span className={`import-row-status ${status}`}>
      <Icon size={14} />
      {statusLabels[status]}
    </span>
  )
}

function translateReason(reason: string | null) {
  if (!reason) {
    return 'Enregistré correctement.'
  }

  const translations: Record<string, string> = {
    'Invalid email or contact data.':
      'Email invalide ou données de contact incorrectes.',
    'Duplicate email in uploaded file.':
      'Email déjà présent dans le fichier chargé.',
    'Duplicate mobile number in uploaded file.':
      'Numéro mobile déjà présent dans le fichier chargé.',
    'Contact email already exists.':
      'Email déjà enregistré dans la base.',
    'Contact mobile number already exists.':
      'Numéro mobile déjà enregistré dans la base.',
    'Contact email or mobile number already exists.':
      'Email ou numéro mobile déjà enregistré dans la base.',
  }

  return translations[reason] ?? reason
}

function formatDate(value: string | undefined) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
