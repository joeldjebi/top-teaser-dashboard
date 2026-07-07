import {
  AlertTriangle,
  MailCheck,
  MousePointerClick,
  RefreshCw,
  Search,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../../../lib/apiClient'
import { Pagination } from '../../../shared/pagination/Pagination'
import { usePagination } from '../../../shared/pagination/usePagination'
import { useAuth } from '../../auth/AuthProvider'
import type { CampaignRecipientStatus } from '../../campaigns/types/campaignTypes'
import { fetchEmailLog, fetchEmailLogs } from '../api/emailLogsApi'
import { EmailLogDetailsPanel } from '../components/EmailLogDetailsPanel'
import { EmailLogsTable } from '../components/EmailLogsTable'
import type { EmailLog } from '../types/emailLogTypes'

const filterOptions: Array<{
  label: string
  value: CampaignRecipientStatus | 'all'
}> = [
  { label: 'Tous', value: 'all' },
  { label: 'Envoyés', value: 'sent' },
  { label: 'Ouverts', value: 'opened' },
  { label: 'Cliqués', value: 'clicked' },
  { label: 'Échecs', value: 'failed' },
  { label: 'Bounces', value: 'bounced' },
  { label: 'Désabonnés', value: 'unsubscribed' },
]

export function EmailLogsPage() {
  const { token } = useAuth()
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    CampaignRecipientStatus | 'all'
  >('all')

  const loadLogs = useCallback(async () => {
    if (!token) {
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const { data } = await fetchEmailLogs(token)
      setLogs(data)
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : 'Impossible de charger les logs.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadLogs()
  }, [loadLogs])

  const stats = useMemo(() => {
    const sent = logs.filter((log) => log.status === 'sent').length
    const opened = logs.filter((log) => log.status === 'opened').length
    const clicked = logs.filter((log) => log.status === 'clicked').length
    const failed = logs.filter(
      (log) => log.status === 'failed' || log.status === 'bounced',
    ).length

    return {
      total: logs.length,
      sent,
      opened,
      clicked,
      failed,
    }
  }, [logs])

  const visibleLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return logs.filter((log) => {
      const matchesStatus =
        statusFilter === 'all' ? true : log.status === statusFilter
      const searchable = [
        log.email,
        log.campaignName,
        log.providerMessageId ?? '',
        log.errorMessage ?? '',
      ]
        .join(' ')
        .toLowerCase()

      return matchesStatus && searchable.includes(normalizedQuery)
    })
  }, [logs, query, statusFilter])

  const logsPagination = usePagination(visibleLogs)

  async function handleSelect(log: EmailLog) {
    if (!token) {
      return
    }

    setSelectedLog(log)
    setError(null)

    try {
      const { data } = await fetchEmailLog(token, log.id)
      setSelectedLog(data)
    } catch (selectError) {
      setError(
        selectError instanceof ApiError
          ? selectError.message
          : 'Impossible de charger le détail du log.',
      )
    }
  }

  return (
    <div className="email-logs-page">
      <section className="page-hero compact-hero">
        <div>
          <p className="eyebrow">Logs</p>
          <h1>Suivez chaque email, du statut provider à l’erreur.</h1>
          <p className="muted">
            Consultez les destinataires préparés, les emails envoyés, les
            ouvertures, les clics, les bounces et les désabonnements.
          </p>
        </div>
        <button className="secondary-button" onClick={loadLogs} type="button">
          <RefreshCw size={18} />
          Actualiser
        </button>
      </section>

      <section className="insight-grid">
        <div className="insight-card">
          <MailCheck size={20} />
          <span>Total logs</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="insight-card">
          <MousePointerClick size={20} />
          <span>Ouverts / cliqués</span>
          <strong>{stats.opened + stats.clicked}</strong>
        </div>
        <div className="insight-card">
          <AlertTriangle size={20} />
          <span>À corriger</span>
          <strong>{stats.failed}</strong>
        </div>
      </section>

      <section className="email-logs-workbench">
        <div className="email-logs-main-panel">
          {error ? <div className="form-alert">{error}</div> : null}

          <div className="toolbar">
            <label className="search-shell">
              <Search size={18} />
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher par email, campagne, provider ID..."
                value={query}
              />
            </label>

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

          {isLoading ? (
            <div className="loading-state">Chargement des logs...</div>
          ) : (
            <EmailLogsTable
              logs={logsPagination.paginatedItems}
              onSelect={handleSelect}
            />
          )}

          <Pagination
            currentPage={logsPagination.currentPage}
            endItem={logsPagination.endItem}
            onPageChange={logsPagination.setCurrentPage}
            startItem={logsPagination.startItem}
            totalItems={logsPagination.totalItems}
            totalPages={logsPagination.totalPages}
          />
        </div>

        <EmailLogDetailsPanel log={selectedLog} />
      </section>
    </div>
  )
}
