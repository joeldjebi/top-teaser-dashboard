import { FileText, Plus, RefreshCw, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../../../lib/apiClient'
import { useConfirmDialog } from '../../../shared/confirm/ConfirmDialogProvider'
import { Pagination } from '../../../shared/pagination/Pagination'
import { usePagination } from '../../../shared/pagination/usePagination'
import { useAuth } from '../../auth/AuthProvider'
import {
  createTemplate,
  deleteTemplate,
  fetchTemplates,
  previewTemplate,
  sendTemplateTest,
  updateTemplate,
} from '../api/templatesApi'
import { TemplateFormPanel } from '../components/TemplateFormPanel'
import { TemplatePresetGallery } from '../components/TemplatePresetGallery'
import { TemplatesList } from '../components/TemplatesList'
import { templatePresets, type TemplatePreset } from '../data/templatePresets'
import type {
  EmailTemplate,
  RenderedTemplate,
  TemplateFormValues,
  TemplatePayload,
} from '../types/templateTypes'

export function TemplatesPage() {
  const { token, user } = useAuth()
  const { confirm } = useConfirmDialog()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [draftPreset, setDraftPreset] = useState<TemplateFormValues | undefined>()
  const [preview, setPreview] = useState<RenderedTemplate | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)

  const loadTemplates = useCallback(async () => {
    if (!token) {
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const { data } = await fetchTemplates(token)
      setTemplates(data)
    } catch (fetchError) {
      setError(
        fetchError instanceof ApiError
          ? fetchError.message
          : 'Impossible de charger les templates.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadTemplates()
  }, [loadTemplates])

  const totalHtml = useMemo(
    () =>
      templates.filter((template) => template.htmlContent.trim().length > 0)
        .length,
    [templates],
  )
  const templatesPagination = usePagination(templates)

  async function handleSubmit(payload: TemplatePayload) {
    if (!token) {
      return
    }

    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      if (editingTemplate) {
        const { data } = await updateTemplate(token, editingTemplate.id, payload)
        setTemplates((current) =>
          current.map((template) => (template.id === data.id ? data : template)),
        )
        setEditingTemplate(null)
        setDraftPreset(undefined)
        setIsFormModalOpen(false)
        setSuccess('Template mis à jour.')
      } else {
        const { data } = await createTemplate(token, payload)
        setTemplates((current) => [data, ...current])
        setDraftPreset(undefined)
        setIsFormModalOpen(false)
        setSuccess('Template créé.')
      }
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : 'Impossible d’enregistrer ce template.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handlePreview(template: EmailTemplate) {
    if (!token) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      const { data } = await previewTemplate(token, template.id)
      setPreview(data)
    } catch (previewError) {
      setError(
        previewError instanceof ApiError
          ? previewError.message
          : 'Impossible de générer l’aperçu.',
      )
    }
  }

  async function handleTestSend(template: EmailTemplate) {
    if (!token || !user?.email) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      await sendTemplateTest(token, template.id, user.email)
      setSuccess(`Email de test envoyé à ${user.email}.`)
    } catch (sendError) {
      setError(
        sendError instanceof ApiError
          ? sendError.message
          : 'Impossible d’envoyer le test.',
      )
    }
  }

  async function handleDelete(template: EmailTemplate) {
    if (!token) {
      return
    }

    const shouldDelete = await confirm({
      title: 'Supprimer ce template ?',
      description: `Le template « ${template.name} » ne sera plus disponible pour les prochaines campagnes.`,
      confirmLabel: 'Supprimer',
      variant: 'danger',
    })

    if (!shouldDelete) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      await deleteTemplate(token, template.id)
      setTemplates((current) =>
        current.filter((candidate) => candidate.id !== template.id),
      )
      setSuccess('Template supprimé.')
      if (editingTemplate?.id === template.id) {
        setEditingTemplate(null)
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof ApiError
          ? deleteError.message
          : 'Impossible de supprimer ce template.',
      )
    }
  }

  function handleEditTemplate(template: EmailTemplate) {
    setDraftPreset(undefined)
    setEditingTemplate(template)
    setIsFormModalOpen(true)
    setSuccess(null)
    setError(null)
  }

  function handleUsePreset(preset: TemplatePreset) {
    setEditingTemplate(null)
    setDraftPreset({
      name: preset.name,
      subject: preset.subject,
      htmlContent: preset.htmlContent,
      textContent: preset.textContent,
    })
    setPreview(null)
    setIsFormModalOpen(true)
    setSuccess(`Le modèle léger « ${preset.name} » est chargé dans l’éditeur.`)
    setError(null)
  }

  function closeFormModal() {
    setIsFormModalOpen(false)
    setEditingTemplate(null)
    setDraftPreset(undefined)
  }

  return (
    <div className="templates-page">
      <section className="page-hero compact-hero">
        <div>
          <p className="eyebrow">Templates</p>
          <h1>Des emails légers, simples à personnaliser.</h1>
          <p className="muted">
            Remplissez le contenu, l’application génère un HTML propre avec
            version texte et variables : {'{{fullName}}'}, {' {{commune}}'},
            {' {{country}}'}, {'{{email}}'}.
          </p>
        </div>
        <div className="hero-actions">
          <button
            className="secondary-button"
            onClick={() => {
              setEditingTemplate(null)
              setDraftPreset(undefined)
              setIsFormModalOpen(true)
              setSuccess(null)
              setError(null)
            }}
            type="button"
          >
            <Plus size={18} />
            Nouveau template
          </button>
          <button className="secondary-button" onClick={loadTemplates} type="button">
            <RefreshCw size={18} />
            Actualiser
          </button>
        </div>
      </section>

      <section className="insight-grid">
        <div className="insight-card">
          <FileText size={20} />
          <span>Total templates</span>
          <strong>{templates.length}</strong>
        </div>
        <div className="insight-card">
          <Sparkles size={20} />
          <span>Templates légers</span>
          <strong>{totalHtml}</strong>
        </div>
        <div className="insight-card">
          <FileText size={20} />
          <span>Variables</span>
          <strong>6</strong>
        </div>
      </section>

      <section className="templates-workbench">
        <div className="templates-main-panel">
          {error ? <div className="form-alert">{error}</div> : null}
          {success ? <div className="success-alert">{success}</div> : null}

          <TemplatePresetGallery
            onUsePreset={handleUsePreset}
            presets={templatePresets}
          />

          {isLoading ? (
            <div className="loading-state">Chargement des templates...</div>
          ) : (
            <TemplatesList
              onDelete={handleDelete}
              onEdit={handleEditTemplate}
              onPreview={handlePreview}
              onTestSend={handleTestSend}
              templates={templatesPagination.paginatedItems}
            />
          )}

          <Pagination
            currentPage={templatesPagination.currentPage}
            endItem={templatesPagination.endItem}
            onPageChange={templatesPagination.setCurrentPage}
            startItem={templatesPagination.startItem}
            totalItems={templatesPagination.totalItems}
            totalPages={templatesPagination.totalPages}
          />

          {preview ? (
            <section className="preview-panel">
              <div>
                <p className="eyebrow">Aperçu</p>
                <h2>{preview.subject}</h2>
              </div>
              <div
                className="email-preview"
                dangerouslySetInnerHTML={{ __html: preview.html }}
              />
              {preview.text ? <pre>{preview.text}</pre> : null}
            </section>
          ) : null}
        </div>
      </section>

      {isFormModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section
            aria-label="Formulaire template"
            className="modal-panel template-form-modal"
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
            <TemplateFormPanel
              initialValues={draftPreset}
              isSubmitting={isSubmitting}
              onCancel={closeFormModal}
              onSubmit={handleSubmit}
              template={editingTemplate}
            />
          </section>
        </div>
      ) : null}
    </div>
  )
}
