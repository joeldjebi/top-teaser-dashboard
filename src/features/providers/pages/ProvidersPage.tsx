import {
  Activity,
  Edit3,
  Mail,
  MessageCircle,
  Phone,
  PlugZap,
  RefreshCw,
  Send,
  Settings,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../../../lib/apiClient'
import { useConfirmDialog } from '../../../shared/confirm/ConfirmDialogProvider'
import { Pagination } from '../../../shared/pagination/Pagination'
import { usePagination } from '../../../shared/pagination/usePagination'
import { useAuth } from '../../auth/AuthProvider'
import {
  createCommunicationProvider,
  deleteCommunicationProvider,
  fetchActiveMailProvider,
  fetchCommunicationProviders,
  fetchMailProviders,
  fetchMailSettings,
  sendMailProviderTest,
  updateCommunicationProvider,
  updateMailSettings,
} from '../api/providersApi'
import { CommunicationProviderFormPanel } from '../components/CommunicationProviderFormPanel'
import { ProviderSettingsPanel } from '../components/ProviderSettingsPanel'
import { ProviderTestPanel } from '../components/ProviderTestPanel'
import { ProviderTestResultPanel } from '../components/ProviderTestResultPanel'
import { ProvidersGrid } from '../components/ProvidersGrid'
import type {
  ActiveMailProvider,
  CommunicationChannel,
  CommunicationProvider,
  CommunicationProviderPayload,
  MailProvider,
  MailSettings,
  MailSettingsPayload,
  MailTestPayload,
  MailTestResult,
} from '../types/providerTypes'

const channelOptions: Array<{
  description: string
  id: CommunicationChannel
  label: string
}> = [
  {
    id: 'email',
    label: 'Email',
    description: 'Postmark, SendGrid, Mailgun, Brevo, Amazon SES',
  },
  {
    id: 'sms',
    label: 'SMS',
    description: 'Twilio, Vonage, Orange SMS, Infobip',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'Meta Cloud API, Twilio WhatsApp, 360dialog',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    description: 'Bot API, passerelle Telegram, notifications privées',
  },
]

export function ProvidersPage() {
  const { token } = useAuth()
  const { confirm } = useConfirmDialog()
  const [providers, setProviders] = useState<MailProvider[]>([])
  const [communicationProviders, setCommunicationProviders] = useState<
    CommunicationProvider[]
  >([])
  const [activeProvider, setActiveProvider] =
    useState<ActiveMailProvider | null>(null)
  const [settings, setSettings] = useState<MailSettings | null>(null)
  const [testResult, setTestResult] = useState<MailTestResult | null>(null)
  const [activeChannel, setActiveChannel] =
    useState<CommunicationChannel>('email')
  const [editingCommunicationProvider, setEditingCommunicationProvider] =
    useState<CommunicationProvider | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [isSavingCommunicationProvider, setIsSavingCommunicationProvider] =
    useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isCommunicationProviderModalOpen, setIsCommunicationProviderModalOpen] =
    useState(false)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)

  const loadProviders = useCallback(async () => {
    if (!token) {
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const [
        providersResponse,
        activeResponse,
        settingsResponse,
        communicationProvidersResponse,
      ] = await Promise.all([
        fetchMailProviders(token),
        fetchActiveMailProvider(token),
        fetchMailSettings(token),
        fetchCommunicationProviders(token),
      ])

      setProviders(providersResponse.data)
      setActiveProvider(activeResponse.data)
      setSettings(settingsResponse.data)
      setCommunicationProviders(communicationProvidersResponse.data)
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

  const visibleCommunicationProviders = useMemo(
    () =>
      communicationProviders.filter(
        (provider) => provider.channel === activeChannel,
      ),
    [activeChannel, communicationProviders],
  )

  const stats = useMemo(() => {
    const configured = providers.filter(
      (provider) => provider.health.configured,
    ).length
    const missingVariables = providers.reduce(
      (total, provider) => total + provider.health.missingConfig.length,
      0,
    )
    const activeCustomProviders = communicationProviders.filter(
      (provider) => provider.isActive,
    ).length

    return {
      total: providers.length + communicationProviders.length,
      configured: configured + activeCustomProviders,
      missingVariables,
    }
  }, [communicationProviders, providers])

  const providersPagination = usePagination(providers)
  const communicationProvidersPagination = usePagination(
    visibleCommunicationProviders,
  )

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
      setSuccess('Configuration provider email enregistrée.')
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

  async function handleSaveCommunicationProvider(
    payload: CommunicationProviderPayload,
  ) {
    if (!token) {
      return
    }

    setError(null)
    setSuccess(null)
    setIsSavingCommunicationProvider(true)

    try {
      if (editingCommunicationProvider) {
        await updateCommunicationProvider(
          token,
          editingCommunicationProvider.id,
          payload,
        )
        setSuccess('Provider mis à jour.')
      } else {
        await createCommunicationProvider(token, payload)
        setSuccess('Provider créé.')
      }

      await loadProviders()
      setEditingCommunicationProvider(null)
      setIsCommunicationProviderModalOpen(false)
    } catch (providerError) {
      setError(
        providerError instanceof ApiError
          ? providerError.message
          : 'Impossible d’enregistrer ce provider.',
      )
    } finally {
      setIsSavingCommunicationProvider(false)
    }
  }

  async function handleDeleteCommunicationProvider(
    provider: CommunicationProvider,
  ) {
    if (!token) {
      return
    }

    const shouldDelete = await confirm({
      title: 'Supprimer ce provider ?',
      description: `Le provider « ${provider.name} » sera supprimé du canal ${provider.channel}.`,
      confirmLabel: 'Supprimer',
      variant: 'danger',
    })

    if (!shouldDelete) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      await deleteCommunicationProvider(token, provider.id)
      setSuccess('Provider supprimé.')
      await loadProviders()
    } catch (deleteError) {
      setError(
        deleteError instanceof ApiError
          ? deleteError.message
          : 'Impossible de supprimer ce provider.',
      )
    }
  }

  const currentPagination =
    activeChannel === 'email'
      ? providersPagination
      : communicationProvidersPagination

  return (
    <div className="providers-page">
      <section className="page-hero compact-hero">
        <div>
          <p className="eyebrow">Providers multicanaux</p>
          <h1>Configurez vos providers Email, SMS, WhatsApp et Telegram.</h1>
          <p className="muted">
            Centralisez les variables techniques, les providers actifs et les
            limites d’envoi pour préparer les campagnes multicanales.
          </p>
        </div>
        <div className="hero-actions">
          <button
            className="secondary-button"
            onClick={() => {
              if (activeChannel === 'email') {
                setIsSettingsModalOpen(true)
                return
              }

              setEditingCommunicationProvider(null)
              setIsCommunicationProviderModalOpen(true)
            }}
            type="button"
          >
            <Settings size={18} />
            {activeChannel === 'email' ? 'Configurer email' : 'Nouveau provider'}
          </button>
          {activeChannel === 'email' ? (
            <button
              className="secondary-button"
              onClick={() => setIsTestModalOpen(true)}
              type="button"
            >
              <Send size={18} />
              Tester l’envoi
            </button>
          ) : null}
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
          <span>Actifs / configurés</span>
          <strong>{stats.configured}</strong>
        </div>
        <div className="insight-card">
          <Activity size={20} />
          <span>Variables email manquantes</span>
          <strong>{stats.missingVariables}</strong>
        </div>
      </section>

      <section className="providers-workbench">
        <div className="providers-main-panel">
          {error ? <div className="form-alert">{error}</div> : null}
          {success ? <div className="success-alert">{success}</div> : null}

          <div className="provider-channel-tabs">
            {channelOptions.map((channel) => {
              const Icon =
                channel.id === 'email'
                  ? Mail
                  : channel.id === 'sms'
                    ? Phone
                    : channel.id === 'whatsapp'
                      ? MessageCircle
                      : Send

              return (
                <button
                  className={activeChannel === channel.id ? 'active' : ''}
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  type="button"
                >
                  <Icon size={18} />
                  <span>{channel.label}</span>
                  <small>{channel.description}</small>
                </button>
              )
            })}
          </div>

          {activeChannel === 'email' && activeProvider ? (
            <section className="active-provider-panel">
              <div>
                <p className="eyebrow">Provider email actif</p>
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
          ) : activeChannel === 'email' ? (
            <ProvidersGrid providers={providersPagination.paginatedItems} />
          ) : (
            <CommunicationProvidersGrid
              onDelete={handleDeleteCommunicationProvider}
              onEdit={(provider) => {
                setEditingCommunicationProvider(provider)
                setIsCommunicationProviderModalOpen(true)
              }}
              providers={communicationProvidersPagination.paginatedItems}
              channel={activeChannel}
            />
          )}

          <Pagination
            currentPage={currentPagination.currentPage}
            endItem={currentPagination.endItem}
            onPageChange={currentPagination.setCurrentPage}
            startItem={currentPagination.startItem}
            totalItems={currentPagination.totalItems}
            totalPages={currentPagination.totalPages}
          />

          {activeChannel === 'email' ? (
            <ProviderTestResultPanel result={testResult} />
          ) : null}
        </div>
      </section>

      {isSettingsModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section
            aria-label="Configuration des providers email"
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

      {isCommunicationProviderModalOpen && activeChannel !== 'email' ? (
        <div className="modal-backdrop" role="presentation">
          <section
            aria-label="Configuration provider multicanal"
            className="modal-panel provider-settings-modal"
            role="dialog"
          >
            <button
              aria-label="Fermer la configuration"
              className="icon-button soft modal-close-button"
              onClick={() => {
                setIsCommunicationProviderModalOpen(false)
                setEditingCommunicationProvider(null)
              }}
              type="button"
            >
              <X size={18} />
            </button>
            <CommunicationProviderFormPanel
              channel={activeChannel}
              isSubmitting={isSavingCommunicationProvider}
              onSubmit={handleSaveCommunicationProvider}
              provider={editingCommunicationProvider}
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

function CommunicationProvidersGrid({
  channel,
  onDelete,
  onEdit,
  providers,
}: {
  channel: CommunicationChannel
  onDelete: (provider: CommunicationProvider) => void
  onEdit: (provider: CommunicationProvider) => void
  providers: CommunicationProvider[]
}) {
  if (providers.length === 0) {
    return (
      <div className="empty-state">
        <strong>Aucun provider {channel}</strong>
        <span>
          Créez un provider pour définir ses variables, ses secrets et ses
          limites d’envoi.
        </span>
      </div>
    )
  }

  return (
    <div className="providers-grid">
      {providers.map((provider) => (
        <article className="provider-card" key={provider.id}>
          <div className="provider-card-header">
            <div className="provider-icon">
              {provider.channel === 'sms' ? (
                <Phone size={20} />
              ) : provider.channel === 'telegram' ? (
                <Send size={20} />
              ) : (
                <MessageCircle size={20} />
              )}
            </div>
            <span
              className={
                provider.isActive
                  ? 'provider-status-badge provider-status-active'
                  : 'provider-status-badge provider-status-missing'
              }
            >
              {provider.isActive ? 'Actif' : 'Inactif'}
            </span>
          </div>

          <div>
            <p className="eyebrow">{provider.providerKey}</p>
            <h3>{provider.name}</h3>
            <p>
              {provider.variables.length} variable(s) ·{' '}
              {provider.limits.maxPerMinute}/min · {provider.limits.maxPerDay}/jour
            </p>
          </div>

          <div className="provider-limit-grid">
            <div>
              <span>Heure</span>
              <strong>{provider.limits.maxPerHour}</strong>
            </div>
            <div>
              <span>Lot</span>
              <strong>{provider.limits.batchSize}</strong>
            </div>
          </div>

          <div className="provider-variable-tags">
            {provider.variables.slice(0, 5).map((variable) => (
              <code key={variable.key}>{variable.key}</code>
            ))}
          </div>

          <div className="provider-card-actions">
            <button
              className="icon-button soft"
              onClick={() => onEdit(provider)}
              title="Modifier"
              type="button"
            >
              <Edit3 size={17} />
            </button>
            <button
              className="icon-button danger"
              onClick={() => onDelete(provider)}
              title="Supprimer"
              type="button"
            >
              <Trash2 size={17} />
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
