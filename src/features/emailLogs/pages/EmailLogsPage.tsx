import {
  Activity,
  AlertTriangle,
  KeyRound,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  clearActivityLogs,
  fetchActivityLogs,
} from '../../activityLogs/api/activityLogsApi'
import type { ActivityLog } from '../../activityLogs/types/activityLogTypes'
import { clearTechnicalLogs, fetchTechnicalLogs } from '../api/emailLogsApi'
import type { TechnicalLog } from '../types/emailLogTypes'
import { useAuth } from '../../auth/AuthProvider'
import { ApiError } from '../../../lib/apiClient'
import { Pagination } from '../../../shared/pagination/Pagination'
import { usePagination } from '../../../shared/pagination/usePagination'
import { useConfirmDialog } from '../../../shared/confirm/ConfirmDialogProvider'

const actionLabels: Record<string, string> = {
  create: 'Création',
  update: 'Modification',
  delete: 'Suppression',
  login: 'Connexion',
  logout: 'Déconnexion',
  update_password: 'Mot de passe',
  update_profile: 'Profil',
}

const resourceLabels: Record<string, string> = {
  auth: 'Authentification',
  admin_roles: 'Rôles admin',
  admin_users: 'Admins',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getActionLabel(action: string) {
  return actionLabels[action] ?? action
}

function getResourceLabel(resource: string) {
  return resourceLabels[resource] ?? resource
}

export function EmailLogsPage() {
  const { token } = useAuth()
  const { confirm } = useConfirmDialog()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [technicalLogs, setTechnicalLogs] = useState<TechnicalLog[]>([])
  const [query, setQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'activity' | 'technical'>('activity')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadLogs = useCallback(async () => {
    if (!token) return

    setError(null)
    setIsLoading(true)

    try {
      const [activityResponse, technicalResponse] = await Promise.all([
        fetchActivityLogs(token),
        fetchTechnicalLogs(token),
      ])
      setLogs(activityResponse.data)
      setTechnicalLogs(technicalResponse.data)
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : 'Impossible de charger les activités.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadLogs()
  }, [loadLogs])

  async function handleClearLogs() {
    if (!token) return

    const shouldClear = await confirm({
      title: 'Vider les logs ?',
      description:
        'Toutes les activités admin et tous les logs techniques seront supprimés. Cette action est définitive.',
      confirmLabel: 'Vider les logs',
      variant: 'danger',
    })

    if (!shouldClear) return

    setError(null)
    setIsLoading(true)

    try {
      const [activityResponse, technicalResponse] = await Promise.all([
        clearActivityLogs(token),
        clearTechnicalLogs(token),
      ])
      setLogs([])
      setTechnicalLogs([])
      setError(null)
      console.info(
        `[Logs] ${activityResponse.data.activityLogs} activité(s) et ${technicalResponse.data.technicalLogs} log(s) technique(s) supprimé(s).`,
      )
    } catch (clearError) {
      setError(
        clearError instanceof ApiError
          ? clearError.message
          : 'Impossible de vider les logs.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const actions = useMemo(
    () => ['all', ...Array.from(new Set(logs.map((log) => log.action)))],
    [logs],
  )

  const stats = useMemo(
    () => ({
      total: logs.length,
      security: logs.filter((log) =>
        ['login', 'logout', 'update_password'].includes(log.action),
      ).length,
      admins: logs.filter((log) => log.resource === 'admin_users').length,
      technicalErrors: technicalLogs.filter((log) => log.level === 'error').length,
    }),
    [logs, technicalLogs],
  )

  const visibleLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return logs.filter((log) => {
      const matchesAction =
        actionFilter === 'all' ? true : log.action === actionFilter
      const searchable = [
        log.actorName ?? '',
        log.actorEmail ?? '',
        log.action,
        log.resource,
        log.resourceId ?? '',
        log.message,
      ]
        .join(' ')
        .toLowerCase()

      return matchesAction && searchable.includes(normalizedQuery)
    })
  }, [actionFilter, logs, query])

  const logsPagination = usePagination(visibleLogs)
  const visibleTechnicalLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return technicalLogs.filter((log) =>
      [
        log.level,
        log.scope,
        log.event,
        log.message,
        log.provider ?? '',
        log.error ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    )
  }, [query, technicalLogs])
  const technicalPagination = usePagination(visibleTechnicalLogs)

  return (
    <div className="email-logs-page">
      <section className="page-hero compact-hero">
        <div>
          <p className="eyebrow">Logs</p>
          <h1>Journal d’activité de la plateforme.</h1>
          <p className="muted">
            Suivez les connexions, créations d’admins, changements de rôles,
            suppressions et actions sensibles.
          </p>
        </div>
        <div className="hero-actions">
          <button className="secondary-button" onClick={loadLogs} type="button">
            <RefreshCw size={18} />
            Actualiser
          </button>
          <button
            className="secondary-button danger-action"
            disabled={logs.length === 0 && technicalLogs.length === 0}
            onClick={handleClearLogs}
            type="button"
          >
            <Trash2 size={18} />
            Vider
          </button>
        </div>
      </section>

      <section className="insight-grid">
        <div className="insight-card">
          <Activity size={20} />
          <span>Activités</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="insight-card">
          <KeyRound size={20} />
          <span>Sécurité</span>
          <strong>{stats.security}</strong>
        </div>
        <div className="insight-card">
          <UserCog size={20} />
          <span>Admins</span>
          <strong>{stats.admins}</strong>
        </div>
        <div className="insight-card">
          <AlertTriangle size={20} />
          <span>Erreurs techniques</span>
          <strong>{stats.technicalErrors}</strong>
        </div>
      </section>

      <section className="activity-log-panel">
        {error ? <div className="form-alert">{error}</div> : null}

        <div className="toolbar">
          <label className="search-shell">
            <Search size={18} />
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher par admin, action, ressource..."
              value={query}
            />
          </label>

          <div className="segmented-control">
            <button
              className={viewMode === 'activity' ? 'active' : ''}
              onClick={() => setViewMode('activity')}
              type="button"
            >
              Activités
            </button>
            <button
              className={viewMode === 'technical' ? 'active' : ''}
              onClick={() => setViewMode('technical')}
              type="button"
            >
              Technique
            </button>
          </div>

          {viewMode === 'activity' ? (
          <div className="segmented-control">
            {actions.map((action) => (
              <button
                className={actionFilter === action ? 'active' : ''}
                key={action}
                onClick={() => setActionFilter(action)}
                type="button"
              >
                {action === 'all' ? 'Toutes' : getActionLabel(action)}
              </button>
            ))}
          </div>
          ) : null}
        </div>

        {isLoading ? (
          <div className="loading-state">Chargement des activités...</div>
        ) : viewMode === 'technical' ? (
          technicalPagination.paginatedItems.length === 0 ? (
            <div className="empty-state">
              <ShieldCheck size={28} />
              <strong>Aucun log technique</strong>
              <span>Les payloads, webhooks et erreurs provider apparaîtront ici.</span>
            </div>
          ) : (
            <div className="activity-log-list">
              {technicalPagination.paginatedItems.map((log) => (
                <article className="activity-log-row" key={log.id}>
                  <div className="activity-log-icon">
                    {log.level === 'error' ? (
                      <AlertTriangle size={18} />
                    ) : (
                      <Activity size={18} />
                    )}
                  </div>
                  <div className="activity-log-content">
                    <div>
                      <strong>{log.message}</strong>
                      <span>
                        {log.scope} · {log.event}
                        {log.provider ? ` · ${log.provider}` : ''}
                      </span>
                    </div>
                    <p>
                      {log.level.toUpperCase()}
                      {log.campaignId ? ` · Campagne #${log.campaignId}` : ''}
                      {log.error ? ` · ${log.error}` : ''}
                    </p>
                  </div>
                  <time>{formatDate(log.createdAt)}</time>
                </article>
              ))}
            </div>
          )
        ) : logsPagination.paginatedItems.length === 0 ? (
          <div className="empty-state">
            <ShieldCheck size={28} />
            <strong>Aucune activité trouvée</strong>
            <span>Les prochaines actions admin apparaîtront ici.</span>
          </div>
        ) : (
          <div className="activity-log-list">
            {logsPagination.paginatedItems.map((log) => (
              <article className="activity-log-row" key={log.id}>
                <div className="activity-log-icon">
                  {log.action.includes('password') ? (
                    <KeyRound size={18} />
                  ) : log.action === 'delete' ? (
                    <AlertTriangle size={18} />
                  ) : (
                    <Activity size={18} />
                  )}
                </div>
                <div className="activity-log-content">
                  <div>
                    <strong>{log.message}</strong>
                    <span>
                      {log.actorName ?? 'Système'} ·{' '}
                      {log.actorEmail ?? 'activité automatique'}
                    </span>
                  </div>
                  <p>
                    {getActionLabel(log.action)} · {getResourceLabel(log.resource)}
                    {log.resourceId ? ` #${log.resourceId}` : ''}
                  </p>
                </div>
                <time>{formatDate(log.createdAt)}</time>
              </article>
            ))}
          </div>
        )}

        {viewMode === 'technical' ? (
          <Pagination
            currentPage={technicalPagination.currentPage}
            endItem={technicalPagination.endItem}
            onPageChange={technicalPagination.setCurrentPage}
            startItem={technicalPagination.startItem}
            totalItems={technicalPagination.totalItems}
            totalPages={technicalPagination.totalPages}
          />
        ) : (
          <Pagination
            currentPage={logsPagination.currentPage}
            endItem={logsPagination.endItem}
            onPageChange={logsPagination.setCurrentPage}
            startItem={logsPagination.startItem}
            totalItems={logsPagination.totalItems}
            totalPages={logsPagination.totalPages}
          />
        )}
      </section>
    </div>
  )
}
