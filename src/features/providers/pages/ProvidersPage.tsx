import {
  Activity,
  PlugZap,
  RefreshCw,
  Send,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../../../lib/apiClient'
import { Pagination } from '../../../shared/pagination/Pagination'
import { usePagination } from '../../../shared/pagination/usePagination'
import { useAuth } from '../../auth/AuthProvider'
import {
  fetchActiveMailProvider,
  fetchMailSettings,
  fetchMailProviders,
  sendMailProviderTest,
  updateMailSettings,
} from '../api/providersApi'
import { ProviderSettingsPanel } from '../components/ProviderSettingsPanel'
import { ProviderTestPanel } from '../components/ProviderTestPanel'
import { ProviderTestResultPanel } from '../components/ProviderTestResultPanel'
import { ProvidersGrid } from '../components/ProvidersGrid'
import type {
  ActiveMailProvider,
  MailSettings,
  MailSettingsPayload,
  MailProvider,
  MailTestPayload,
  MailTestResult,
} from '../types/providerTypes'

export function ProvidersPage() {
  const { token } = useAuth()
  const [providers, setProviders] = useState<MailProvider[]>([])
  const [activeProvider, setActiveProvider] =
    useState<ActiveMailProvider | null>(null)
  const [settings, setSettings] = useState<MailSettings | null>(null)
  const [testResult, setTestResult] = useState<MailTestResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)

  const loadProviders = useCallback(async () => {
    if (!token) {
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const [providersResponse, activeResponse, settingsResponse] = await Promise.all([
        fetchMailProviders(token),
        fetchActiveMailProvider(token),
        fetchMailSettings(token),
      ])

      setProviders(providersResponse.data)
      setActiveProvider(activeResponse.data)
      setSettings(settingsResponse.data)
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : 'Impossible de charger les providers.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadProviders()
  }, [loadProviders])

  const stats = useMemo(() => {
    const configured = providers.filter(
      (provider) => provider.health.configured,
    ).length
    const missingVariables = providers.reduce(
      (total, provider) => total + provider.health.missingConfig.length,
      0,
    )

    return {
      total: providers.length,
      configured,
      missingVariables,
    }
  }, [providers])
  const providersPagination = usePagination(providers)

  async function handleTest(payload: MailTestPayload) {
    if (!token) {
      return
    }

    setError(null)
    setSuccess(null)
    setTestResult(null)
    setIsTesting(true)

    try {
      const { data } = await sendMailProviderTest(token, payload)
      setTestResult(data)
      setSuccess('Email de test envoyé ou accepté par le provider actif.')
      setIsTestModalOpen(false)
    } catch (testError) {
      setError(
        testError instanceof ApiError
          ? testError.message
          : 'Impossible d’envoyer l’email de test.',
      )
    } finally {
      setIsTesting(false)
    }
  }

  async function handleSaveSettings(payload: MailSettingsPayload) {
    if (!token) {
      return
    }

    setError(null)
    setSuccess(null)
    setIsSavingSettings(true)

    try {
      const { data } = await updateMailSettings(token, payload)
      setSettings(data)
      setSuccess('Configuration provider enregistrée.')
      await loadProviders()
      setIsSettingsModalOpen(false)
    } catch (settingsError) {
      setError(
        settingsError instanceof ApiError
          ? settingsError.message
          : 'Impossible d’enregistrer la configuration provider.',
      )
    } finally {
      setIsSavingSettings(false)
    }
  }

  return (
    <div className="providers-page">
      <section className="page-hero compact-hero">
        <div>
          <p className="eyebrow">Providers</p>
          <h1>Configurez et diagnostiquez vos services d’envoi.</h1>
          <p className="muted">
            Vérifiez Postmark, SendGrid, Mailgun, Brevo et Amazon SES avant
            d’envoyer vos campagnes.
          </p>
        </div>
        <div className="hero-actions">
          <button
            className="secondary-button"
            onClick={() => setIsSettingsModalOpen(true)}
            type="button"
          >
            <Settings size={18} />
            Configurer
          </button>
          <button
            className="secondary-button"
            onClick={() => setIsTestModalOpen(true)}
            type="button"
          >
            <Send size={18} />
            Tester l’envoi
          </button>
          <button className="secondary-button" onClick={loadProviders} type="button">
            <RefreshCw size={18} />
            Actualiser
          </button>
        </div>
      </section>

      <section className="insight-grid">
        <div className="insight-card">
          <PlugZap size={20} />
          <span>Providers</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="insight-card">
          <ShieldCheck size={20} />
          <span>Configurés</span>
          <strong>{stats.configured}</strong>
        </div>
        <div className="insight-card">
          <Activity size={20} />
          <span>Variables manquantes</span>
          <strong>{stats.missingVariables}</strong>
        </div>
      </section>

      <section className="providers-workbench">
        <div className="providers-main-panel">
          {error ? <div className="form-alert">{error}</div> : null}
          {success ? <div className="success-alert">{success}</div> : null}

          {activeProvider ? (
            <section className="active-provider-panel">
              <div>
                <p className="eyebrow">Provider actif</p>
                <h2>{activeProvider.name}</h2>
              </div>
              <span
                className={
                  activeProvider.health.configured
                    ? 'provider-status-badge provider-status-active'
                    : 'provider-status-badge provider-status-missing'
                }
              >
                {activeProvider.health.configured
                  ? 'Prêt pour l’envoi'
                  : 'Configuration incomplète'}
              </span>
            </section>
          ) : null}

          {isLoading ? (
            <div className="loading-state">Chargement des providers...</div>
          ) : (
            <ProvidersGrid providers={providersPagination.paginatedItems} />
          )}

          <Pagination
            currentPage={providersPagination.currentPage}
            endItem={providersPagination.endItem}
            onPageChange={providersPagination.setCurrentPage}
            startItem={providersPagination.startItem}
            totalItems={providersPagination.totalItems}
            totalPages={providersPagination.totalPages}
          />

          <ProviderTestResultPanel result={testResult} />
        </div>
      </section>

      {isSettingsModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section
            aria-label="Configuration des providers"
            className="modal-panel provider-settings-modal"
            role="dialog"
          >
            <button
              aria-label="Fermer la configuration"
              className="icon-button soft modal-close-button"
              onClick={() => setIsSettingsModalOpen(false)}
              type="button"
            >
              <X size={18} />
            </button>
            <ProviderSettingsPanel
              isSubmitting={isSavingSettings}
              onSubmit={handleSaveSettings}
              providers={providers}
              settings={settings}
            />
          </section>
        </div>
      ) : null}

      {isTestModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section
            aria-label="Test d’envoi provider"
            className="modal-panel provider-test-modal"
            role="dialog"
          >
            <button
              aria-label="Fermer le test d’envoi"
              className="icon-button soft modal-close-button"
              onClick={() => setIsTestModalOpen(false)}
              type="button"
            >
              <X size={18} />
            </button>
            <ProviderTestPanel isSubmitting={isTesting} onSubmit={handleTest} />
          </section>
        </div>
      ) : null}
    </div>
  )
}
