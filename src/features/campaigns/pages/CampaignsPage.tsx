import {
  BarChart3,
  CheckCircle2,
  MailCheck,
  Plus,
  RefreshCw,
  Search,
  Send,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../../../lib/apiClient'
import { useConfirmDialog } from '../../../shared/confirm/ConfirmDialogProvider'
import { Pagination } from '../../../shared/pagination/Pagination'
import { usePagination } from '../../../shared/pagination/usePagination'
import { useAuth } from '../../auth/AuthProvider'
import { fetchContactLists } from '../../contactLists/api/contactListsApi'
import type { ContactList } from '../../contactLists/types/contactListTypes'
import { fetchTemplates } from '../../templates/api/templatesApi'
import type { EmailTemplate } from '../../templates/types/templateTypes'
import {
  cancelCampaign,
  createCampaign,
  deleteCampaign,
  fetchCampaignRecipients,
  fetchCampaignStats,
  fetchCampaigns,
  prepareCampaign,
  sendCampaign,
  syncCampaignBulkStatus,
  updateCampaign,
} from '../api/campaignsApi'
import { CampaignDetailsPanel } from '../components/CampaignDetailsPanel'
import { CampaignFormPanel } from '../components/CampaignFormPanel'
import { CampaignsTable } from '../components/CampaignsTable'
import type {
  Campaign,
  CampaignPayload,
  CampaignRecipient,
  CampaignStats,
  CampaignStatus,
} from '../types/campaignTypes'

const filterOptions: Array<{ label: string; value: CampaignStatus | 'all' }> = [
  { label: 'Toutes', value: 'all' },
  { label: 'Brouillons', value: 'draft' },
  { label: 'Prêtes', value: 'ready' },
  { label: 'En cours', value: 'sending' },
  { label: 'Envoyées', value: 'sent' },
  { label: 'Échecs', value: 'failed' },
]

type SendProgress = {
  campaignName: string
  failed: number
  message: string
  progress: number
  sent: number
  status: 'sending' | 'success' | 'warning' | 'error'
  total: number
}

export function CampaignsPage() {
  const { token } = useAuth()
  const { confirm } = useConfirmDialog()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [contactLists, setContactLists] = useState<ContactList[]>([])
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [selectedStats, setSelectedStats] = useState<CampaignStats | null>(null)
  const [selectedRecipients, setSelectedRecipients] = useState<CampaignRecipient[]>(
    [],
  )
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isSyncingBulkStatus, setIsSyncingBulkStatus] = useState(false)
  const [sendProgress, setSendProgress] = useState<SendProgress | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all')

  const loadCampaigns = useCallback(async () => {
    if (!token) {
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const [campaignsResponse, templatesResponse, listsResponse] =
        await Promise.all([
          fetchCampaigns(token),
          fetchTemplates(token),
          fetchContactLists(token),
        ])

      setCampaigns(campaignsResponse.data)
      setTemplates(templatesResponse.data)
      setContactLists(listsResponse.data)
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : 'Impossible de charger les campagnes.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadCampaigns()
  }, [loadCampaigns])

  // Polling: refresh campaigns every 10 seconds
  useEffect(() => {
    const pollInterval = setInterval(() => {
      void loadCampaigns()
    }, 10000)

    return () => clearInterval(pollInterval)
  }, [loadCampaigns])

  // Sync selected campaign with updated campaigns from polling
  useEffect(() => {
    if (selectedCampaign) {
      const updatedCampaign = campaigns.find(
        (c) => c.id === selectedCampaign.id,
      )
      if (updatedCampaign) {
        setSelectedCampaign(updatedCampaign)
      }
    }
  }, [campaigns, selectedCampaign])

  const stats = useMemo(() => {
    const sent = campaigns.filter((campaign) => campaign.status === 'sent').length
    const ready = campaigns.filter((campaign) => campaign.status === 'ready').length
    const totalRecipients = campaigns.reduce(
      (total, campaign) => total + campaign.recipientsCount,
      0,
    )

    return {
      total: campaigns.length,
      ready,
      sent,
      totalRecipients,
    }
  }, [campaigns])

  const visibleCampaigns = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return campaigns.filter((campaign) => {
      const matchesStatus =
        statusFilter === 'all' ? true : campaign.status === statusFilter
      const searchable = `${campaign.name} ${campaign.subject}`.toLowerCase()

      return matchesStatus && searchable.includes(normalizedQuery)
    })
  }, [campaigns, query, statusFilter])

  const campaignsPagination = usePagination(visibleCampaigns)

  async function handleSubmit(payload: CampaignPayload) {
    if (!token) {
      return
    }

    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      if (editingCampaign) {
        const { data } = await updateCampaign(token, editingCampaign.id, payload)
        setCampaigns((current) =>
          current.map((campaign) => (campaign.id === data.id ? data : campaign)),
        )
        setEditingCampaign(null)
        setIsFormModalOpen(false)
        setSuccess('Campagne mise à jour.')
      } else {
        const { data } = await createCampaign(token, payload)
        setCampaigns((current) => [data, ...current])
        setIsFormModalOpen(false)
        setSuccess('Campagne créée.')
      }
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : 'Impossible d’enregistrer cette campagne.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSelect(campaign: Campaign) {
    if (!token) {
      return
    }

    setSelectedCampaign(campaign)
    setSelectedStats(null)
    setSelectedRecipients([])
    setError(null)

    try {
      const [statsResponse, recipientsResponse] = await Promise.all([
        fetchCampaignStats(token, campaign.id),
        fetchCampaignRecipients(token, campaign.id),
      ])
      setSelectedStats(statsResponse.data)
      setSelectedRecipients(recipientsResponse.data)
    } catch (detailsError) {
      setError(
        detailsError instanceof ApiError
          ? detailsError.message
          : 'Impossible de charger les détails de la campagne.',
      )
    }
  }

  async function handlePrepare(campaign: Campaign) {
    if (!token) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      const { data } = await prepareCampaign(token, campaign.id)
      replaceCampaign(data.campaign)
      setSuccess(`${data.preparedRecipients} destinataire(s) préparé(s).`)
      await handleSelect(data.campaign)
    } catch (prepareError) {
      setError(
        prepareError instanceof ApiError
          ? prepareError.message
          : 'Impossible de préparer cette campagne.',
      )
    }
  }

  async function handleSend(campaign: Campaign) {
    if (!token) {
      return
    }

    const shouldSend = await confirm({
      title: 'Envoyer cette campagne maintenant ?',
      description: `La campagne « ${campaign.name} » sera envoyée aux destinataires préparés. Vous pourrez suivre la progression juste après validation.`,
      confirmLabel: 'Envoyer',
      variant: 'success',
    })

    if (!shouldSend) {
      return
    }

    setError(null)
    setSuccess(null)
    setSendProgress({
      campaignName: campaign.name,
      failed: 0,
      message: 'Connexion au provider et envoi des emails en cours...',
      progress: 18,
      sent: 0,
      status: 'sending',
      total: campaign.recipientsCount,
    })

    try {
      const { data } = await sendCampaign(token, campaign.id)
      const detailedError = data.campaign.errorMessage
      const isBulkProcessing =
        data.campaign.sendMode === 'bulk' && data.campaign.status === 'sending'
      replaceCampaign(data.campaign)
      setSendProgress({
        campaignName: campaign.name,
        failed: data.failed,
        message:
          isBulkProcessing
            ? detailedError ??
              'Postmark a accepté la requête Bulk. Synchronisez le statut pour suivre la progression.'
            : data.failed === 0
              ? 'Tous les emails ont été envoyés correctement.'
              : detailedError ??
                `${data.failed} email(s) n’ont pas pu être envoyés. Consultez les logs pour les détails.`,
        progress: isBulkProcessing ? 35 : 100,
        sent: data.sent,
        status: isBulkProcessing
          ? 'warning'
          : data.failed === 0
            ? 'success'
            : 'warning',
        total: data.stats.total || campaign.recipientsCount,
      })
      setSuccess(
        isBulkProcessing
          ? 'Requête Bulk acceptée par Postmark.'
          : `${data.sent} email(s) envoyé(s), ${data.failed} échec(s).`,
      )
      await handleSelect(data.campaign)
    } catch (sendError) {
      setSendProgress({
        campaignName: campaign.name,
        failed: 0,
        message:
          sendError instanceof ApiError
            ? sendError.message
            : 'Impossible d’envoyer cette campagne.',
        progress: 100,
        sent: 0,
        status: 'error',
        total: campaign.recipientsCount,
      })
      setError(
        sendError instanceof ApiError
          ? sendError.message
          : 'Impossible d’envoyer cette campagne.',
      )
    }
  }

  async function handleSyncBulkStatus(campaign: Campaign) {
    if (!token) {
      return
    }

    setError(null)
    setSuccess(null)
    setIsSyncingBulkStatus(true)

    try {
      const { data } = await syncCampaignBulkStatus(token, campaign.id)
      replaceCampaign(data.campaign)
      setSelectedStats(data.stats)

      const recipientsResponse = await fetchCampaignRecipients(token, campaign.id)
      setSelectedRecipients(recipientsResponse.data)

      const percent =
        typeof data.bulkStatus.percentageCompleted === 'number'
          ? ` (${Math.round(data.bulkStatus.percentageCompleted)} %)`
          : ''

      setSuccess(`Statut Bulk Postmark : ${data.bulkStatus.status}${percent}.`)
    } catch (syncError) {
      setError(
        syncError instanceof ApiError
          ? syncError.message
          : 'Impossible de synchroniser le statut Bulk.',
      )
    } finally {
      setIsSyncingBulkStatus(false)
    }
  }

  async function handleCancel(campaign: Campaign) {
    if (!token) {
      return
    }

    const shouldCancel = await confirm({
      title: 'Annuler cette campagne ?',
      description: `La campagne « ${campaign.name} » passera en statut annulé et ne pourra plus être envoyée sans nouvelle préparation.`,
      confirmLabel: 'Annuler la campagne',
      variant: 'warning',
    })

    if (!shouldCancel) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      const { data } = await cancelCampaign(token, campaign.id)
      replaceCampaign(data)
      setSuccess('Campagne annulée.')
    } catch (cancelError) {
      setError(
        cancelError instanceof ApiError
          ? cancelError.message
          : 'Impossible d’annuler cette campagne.',
      )
    }
  }

  async function handleDelete(campaign: Campaign) {
    if (!token) {
      return
    }

    const shouldDelete = await confirm({
      title: 'Supprimer cette campagne ?',
      description: `La campagne « ${campaign.name} » sera retirée de la liste. Cette action est définitive.`,
      confirmLabel: 'Supprimer',
      variant: 'danger',
    })

    if (!shouldDelete) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      await deleteCampaign(token, campaign.id)
      setCampaigns((current) =>
        current.filter((candidate) => candidate.id !== campaign.id),
      )
      if (selectedCampaign?.id === campaign.id) {
        setSelectedCampaign(null)
        setSelectedStats(null)
        setSelectedRecipients([])
      }
      if (editingCampaign?.id === campaign.id) {
        setEditingCampaign(null)
      }
      setSuccess('Campagne supprimée.')
    } catch (deleteError) {
      setError(
        deleteError instanceof ApiError
          ? deleteError.message
          : 'Impossible de supprimer cette campagne.',
      )
    }
  }

  function replaceCampaign(campaign: Campaign) {
    setCampaigns((current) =>
      current.map((candidate) =>
        candidate.id === campaign.id ? campaign : candidate,
      ),
    )

    if (selectedCampaign?.id === campaign.id) {
      setSelectedCampaign(campaign)
    }
  }

  return (
    <div className="campaigns-page">
      <section className="page-hero compact-hero">
        <div>
          <p className="eyebrow">Campagnes</p>
          <h1>Préparez, envoyez et suivez vos emails en masse.</h1>
          <p className="muted">
            Assemblez un template, une liste de contacts et un objet, puis
            contrôlez chaque étape avant l’envoi.
          </p>
        </div>
        <div className="hero-actions">
          <button
            className="secondary-button"
            onClick={() => {
              setEditingCampaign(null)
              setIsFormModalOpen(true)
            }}
            type="button"
          >
            <Plus size={18} />
            Nouvelle campagne
          </button>
          <button className="secondary-button" onClick={loadCampaigns} type="button">
            <RefreshCw size={18} />
            Actualiser
          </button>
        </div>
      </section>

      <section className="insight-grid">
        <div className="insight-card">
          <Send size={20} />
          <span>Total campagnes</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="insight-card">
          <MailCheck size={20} />
          <span>Prêtes</span>
          <strong>{stats.ready}</strong>
        </div>
        <div className="insight-card">
          <BarChart3 size={20} />
          <span>Destinataires</span>
          <strong>{stats.totalRecipients}</strong>
        </div>
      </section>

      <section className="campaigns-workbench">
        <div className="campaigns-main-panel">
          {error ? <div className="form-alert">{error}</div> : null}
          {success ? <div className="success-alert">{success}</div> : null}

          <div className="toolbar">
            <label className="search-shell">
              <Search size={18} />
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher une campagne..."
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
            <div className="loading-state">Chargement des campagnes...</div>
          ) : (
            <CampaignsTable
              campaigns={campaignsPagination.paginatedItems}
              onCancel={handleCancel}
              onDelete={handleDelete}
              onEdit={(campaign) => {
                setEditingCampaign(campaign)
                setIsFormModalOpen(true)
                setSuccess(null)
                setError(null)
              }}
              onPrepare={handlePrepare}
              onSelect={handleSelect}
              onSend={handleSend}
            />
          )}

          <Pagination
            currentPage={campaignsPagination.currentPage}
            endItem={campaignsPagination.endItem}
            onPageChange={campaignsPagination.setCurrentPage}
            startItem={campaignsPagination.startItem}
            totalItems={campaignsPagination.totalItems}
            totalPages={campaignsPagination.totalPages}
          />

          <CampaignDetailsPanel
            campaign={selectedCampaign}
            isSyncingBulkStatus={isSyncingBulkStatus}
            onSyncBulkStatus={handleSyncBulkStatus}
            recipients={selectedRecipients}
            stats={selectedStats}
          />
        </div>
      </section>

      {isFormModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section
            aria-label="Formulaire campagne"
            className="modal-panel campaign-form-modal"
            role="dialog"
          >
            <button
              aria-label="Fermer le formulaire"
              className="icon-button soft modal-close-button"
              onClick={() => {
                setIsFormModalOpen(false)
                setEditingCampaign(null)
              }}
              type="button"
            >
              <X size={18} />
            </button>
            <CampaignFormPanel
              campaign={editingCampaign}
              contactLists={contactLists}
              isSubmitting={isSubmitting}
              onCancel={() => {
                setEditingCampaign(null)
                setIsFormModalOpen(false)
              }}
              onSubmit={handleSubmit}
              templates={templates}
            />
          </section>
        </div>
      ) : null}

      {sendProgress ? (
        <div className="modal-backdrop" role="presentation">
          <section
            aria-label="Progression de l’envoi"
            className="modal-panel send-progress-modal"
            role="dialog"
          >
            {sendProgress.status !== 'sending' ? (
              <button
                aria-label="Fermer la progression"
                className="icon-button soft modal-close-button"
                onClick={() => setSendProgress(null)}
                type="button"
              >
                <X size={18} />
              </button>
            ) : null}
            <div className="send-progress-panel">
              <div className={`send-progress-icon ${sendProgress.status}`}>
                {sendProgress.status === 'sending' ? (
                  <Send size={22} />
                ) : (
                  <CheckCircle2 size={22} />
                )}
              </div>
              <div>
                <p className="eyebrow">Progression</p>
                <h2>{sendProgress.campaignName}</h2>
                <p className="muted">{sendProgress.message}</p>
              </div>
              <div className="progress-track">
                <span style={{ width: `${sendProgress.progress}%` }} />
              </div>
              <div className="send-progress-stats">
                <div>
                  <span>Total</span>
                  <strong>{sendProgress.total}</strong>
                </div>
                <div>
                  <span>Envoyés</span>
                  <strong>{sendProgress.sent}</strong>
                </div>
                <div>
                  <span>Échecs</span>
                  <strong>{sendProgress.failed}</strong>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
