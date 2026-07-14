import { Globe2, Save, Search, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { ApiError } from '../../../lib/apiClient'
import { useAuth } from '../../auth/AuthProvider'
import {
  fetchLandingAdmin,
  updateLandingContact,
  updateLandingPage,
  updateLandingSection,
} from '../api/landingAdminApi'
import type { LandingContent, LandingSection } from '../types/landingAdminTypes'

type PageForm = {
  title: string
  brandName: string
  slogan: string
  seoTitle: string
  seoDescription: string
  baseline: string
  isPublished: boolean
}

type SectionForm = {
  eyebrow: string
  title: string
  subtitle: string
  body: string
  ctaLabel: string
  ctaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  isEnabled: boolean
}

type ContactForm = {
  phone: string
  whatsapp: string
  email: string
  address: string
  openingHours: string
  formRecipient: string
}

function toPageForm(content: LandingContent | null): PageForm {
  return {
    title: content?.page.title ?? '',
    brandName: content?.page.brandName ?? '',
    slogan: content?.page.slogan ?? '',
    seoTitle: content?.page.seoTitle ?? '',
    seoDescription: content?.page.seoDescription ?? '',
    baseline: content?.page.baseline ?? '',
    isPublished: content?.page.isPublished ?? true,
  }
}

function toSectionForm(section: LandingSection | null): SectionForm {
  return {
    eyebrow: section?.eyebrow ?? '',
    title: section?.title ?? '',
    subtitle: section?.subtitle ?? '',
    body: section?.body ?? '',
    ctaLabel: section?.ctaLabel ?? '',
    ctaHref: section?.ctaHref ?? '',
    secondaryCtaLabel: section?.secondaryCtaLabel ?? '',
    secondaryCtaHref: section?.secondaryCtaHref ?? '',
    isEnabled: section?.isEnabled ?? true,
  }
}

function toContactForm(content: LandingContent | null): ContactForm {
  return {
    phone: content?.contact?.phone ?? '',
    whatsapp: content?.contact?.whatsapp ?? '',
    email: content?.contact?.email ?? '',
    address: content?.contact?.address ?? '',
    openingHours: content?.contact?.openingHours ?? '',
    formRecipient: content?.contact?.formRecipient ?? '',
  }
}

export function LandingAdminPage() {
  const { token, user } = useAuth()
  const [content, setContent] = useState<LandingContent | null>(null)
  const [selectedSectionKey, setSelectedSectionKey] = useState('hero')
  const [pageForm, setPageForm] = useState<PageForm>(toPageForm(null))
  const [sectionForm, setSectionForm] = useState<SectionForm>(toSectionForm(null))
  const [contactForm, setContactForm] = useState<ContactForm>(toContactForm(null))
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const canUpdate = Boolean(user?.permissions.landing.update)

  const selectedSection = useMemo(
    () =>
      content?.sections.find((section) => section.sectionKey === selectedSectionKey) ??
      null,
    [content, selectedSectionKey],
  )

  const load = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetchLandingAdmin(token)
      setContent(response.data)
      setPageForm(toPageForm(response.data))
      setContactForm(toContactForm(response.data))
      const firstSection = response.data.sections[0]
      setSelectedSectionKey((current) =>
        response.data.sections.some((section) => section.sectionKey === current)
          ? current
          : firstSection?.sectionKey ?? 'hero',
      )
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : 'Impossible de charger la landing page.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setSectionForm(toSectionForm(selectedSection))
  }, [selectedSection])

  async function handleSavePage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await updateLandingPage(token, {
        ...pageForm,
        slogan: pageForm.slogan || null,
        seoTitle: pageForm.seoTitle || null,
        seoDescription: pageForm.seoDescription || null,
        baseline: pageForm.baseline || null,
      })
      setContent(response.data)
      setSuccess('Identité de la landing mise à jour.')
    } catch (saveError) {
      setError(
        saveError instanceof ApiError
          ? saveError.message
          : 'Impossible de modifier la landing.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token || !selectedSection) return
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await updateLandingSection(token, selectedSection.sectionKey, {
        ...sectionForm,
        eyebrow: sectionForm.eyebrow || null,
        subtitle: sectionForm.subtitle || null,
        body: sectionForm.body || null,
        ctaLabel: sectionForm.ctaLabel || null,
        ctaHref: sectionForm.ctaHref || null,
        secondaryCtaLabel: sectionForm.secondaryCtaLabel || null,
        secondaryCtaHref: sectionForm.secondaryCtaHref || null,
      })
      setContent(response.data)
      setSuccess('Section mise à jour.')
    } catch (saveError) {
      setError(
        saveError instanceof ApiError
          ? saveError.message
          : 'Impossible de modifier cette section.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await updateLandingContact(token, {
        phone: contactForm.phone || null,
        whatsapp: contactForm.whatsapp || null,
        email: contactForm.email || null,
        address: contactForm.address || null,
        openingHours: contactForm.openingHours || null,
        formRecipient: contactForm.formRecipient || null,
      })
      setContent(response.data)
      setSuccess('Coordonnées mises à jour.')
    } catch (saveError) {
      setError(
        saveError instanceof ApiError
          ? saveError.message
          : 'Impossible de modifier les coordonnées.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="empty-state">Chargement de la landing page...</div>
  }

  return (
    <div className="landing-admin-page">
      <section className="page-hero landing-admin-hero">
        <div>
          <p className="eyebrow">Landing page</p>
          <h2>Gestion de la vitrine TOP TEASER</h2>
          <p>
            Pilotez les textes publics, les sections, les coordonnées et la structure
            commerciale de la page d’accueil.
          </p>
        </div>
        <div className="landing-admin-status">
          <Globe2 aria-hidden="true" size={22} />
          <span>{content?.page.isPublished ? 'Publié' : 'Brouillon'}</span>
        </div>
      </section>

      {error ? <div className="form-alert error">{error}</div> : null}
      {success ? <div className="form-alert success">{success}</div> : null}

      <section className="landing-admin-grid">
        <form className="landing-admin-panel" onSubmit={handleSavePage}>
          <div className="landing-admin-panel-title">
            <Search aria-hidden="true" size={20} />
            <div>
              <h3>Identité & SEO</h3>
              <p>Nom, slogan, baseline et métadonnées de référencement.</p>
            </div>
          </div>

          <label>
            Titre
            <input
              value={pageForm.title}
              onChange={(event) => setPageForm({ ...pageForm, title: event.target.value })}
              disabled={!canUpdate}
            />
          </label>
          <label>
            Marque
            <input
              value={pageForm.brandName}
              onChange={(event) =>
                setPageForm({ ...pageForm, brandName: event.target.value })
              }
              disabled={!canUpdate}
            />
          </label>
          <label>
            Slogan
            <input
              value={pageForm.slogan}
              onChange={(event) =>
                setPageForm({ ...pageForm, slogan: event.target.value })
              }
              disabled={!canUpdate}
            />
          </label>
          <label>
            Baseline SEO
            <textarea
              value={pageForm.baseline}
              onChange={(event) =>
                setPageForm({ ...pageForm, baseline: event.target.value })
              }
              disabled={!canUpdate}
            />
          </label>
          <label>
            Titre SEO
            <input
              value={pageForm.seoTitle}
              onChange={(event) =>
                setPageForm({ ...pageForm, seoTitle: event.target.value })
              }
              disabled={!canUpdate}
            />
          </label>
          <label>
            Description SEO
            <textarea
              value={pageForm.seoDescription}
              onChange={(event) =>
                setPageForm({ ...pageForm, seoDescription: event.target.value })
              }
              disabled={!canUpdate}
            />
          </label>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={pageForm.isPublished}
              onChange={(event) =>
                setPageForm({ ...pageForm, isPublished: event.target.checked })
              }
              disabled={!canUpdate}
            />
            Page publiée
          </label>
          <button className="primary-button" type="submit" disabled={!canUpdate || isSaving}>
            <Save aria-hidden="true" size={18} />
            Enregistrer
          </button>
        </form>

        <form className="landing-admin-panel" onSubmit={handleSaveSection}>
          <div className="landing-admin-panel-title">
            <Sparkles aria-hidden="true" size={20} />
            <div>
              <h3>Sections</h3>
              <p>Modifiez les blocs éditoriaux affichés sur la vitrine.</p>
            </div>
          </div>

          <div className="landing-section-tabs">
            {content?.sections.map((section) => (
              <button
                className={selectedSectionKey === section.sectionKey ? 'active' : ''}
                key={section.id}
                onClick={() => setSelectedSectionKey(section.sectionKey)}
                type="button"
              >
                {section.sectionKey}
              </button>
            ))}
          </div>

          <label>
            Pré-titre
            <input
              value={sectionForm.eyebrow}
              onChange={(event) =>
                setSectionForm({ ...sectionForm, eyebrow: event.target.value })
              }
              disabled={!canUpdate}
            />
          </label>
          <label>
            Titre
            <input
              value={sectionForm.title}
              onChange={(event) =>
                setSectionForm({ ...sectionForm, title: event.target.value })
              }
              disabled={!canUpdate}
            />
          </label>
          <label>
            Sous-titre
            <textarea
              value={sectionForm.subtitle}
              onChange={(event) =>
                setSectionForm({ ...sectionForm, subtitle: event.target.value })
              }
              disabled={!canUpdate}
            />
          </label>
          <label>
            Texte
            <textarea
              value={sectionForm.body}
              onChange={(event) =>
                setSectionForm({ ...sectionForm, body: event.target.value })
              }
              disabled={!canUpdate}
            />
          </label>
          <div className="landing-admin-two-cols">
            <label>
              CTA principal
              <input
                value={sectionForm.ctaLabel}
                onChange={(event) =>
                  setSectionForm({ ...sectionForm, ctaLabel: event.target.value })
                }
                disabled={!canUpdate}
              />
            </label>
            <label>
              Lien CTA
              <input
                value={sectionForm.ctaHref}
                onChange={(event) =>
                  setSectionForm({ ...sectionForm, ctaHref: event.target.value })
                }
                disabled={!canUpdate}
              />
            </label>
          </div>
          <div className="landing-admin-two-cols">
            <label>
              CTA secondaire
              <input
                value={sectionForm.secondaryCtaLabel}
                onChange={(event) =>
                  setSectionForm({
                    ...sectionForm,
                    secondaryCtaLabel: event.target.value,
                  })
                }
                disabled={!canUpdate}
              />
            </label>
            <label>
              Lien secondaire
              <input
                value={sectionForm.secondaryCtaHref}
                onChange={(event) =>
                  setSectionForm({
                    ...sectionForm,
                    secondaryCtaHref: event.target.value,
                  })
                }
                disabled={!canUpdate}
              />
            </label>
          </div>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={sectionForm.isEnabled}
              onChange={(event) =>
                setSectionForm({ ...sectionForm, isEnabled: event.target.checked })
              }
              disabled={!canUpdate}
            />
            Section visible
          </label>
          <button className="primary-button" type="submit" disabled={!canUpdate || isSaving}>
            <Save aria-hidden="true" size={18} />
            Enregistrer la section
          </button>
        </form>
      </section>

      <section className="landing-admin-grid compact">
        <form className="landing-admin-panel" onSubmit={handleSaveContact}>
          <div className="landing-admin-panel-title">
            <Globe2 aria-hidden="true" size={20} />
            <div>
              <h3>Coordonnées</h3>
              <p>Informations affichées dans la section contact.</p>
            </div>
          </div>
          <div className="landing-admin-two-cols">
            <label>
              Téléphone
              <input
                value={contactForm.phone}
                onChange={(event) =>
                  setContactForm({ ...contactForm, phone: event.target.value })
                }
                disabled={!canUpdate}
              />
            </label>
            <label>
              WhatsApp
              <input
                value={contactForm.whatsapp}
                onChange={(event) =>
                  setContactForm({ ...contactForm, whatsapp: event.target.value })
                }
                disabled={!canUpdate}
              />
            </label>
          </div>
          <div className="landing-admin-two-cols">
            <label>
              E-mail
              <input
                value={contactForm.email}
                onChange={(event) =>
                  setContactForm({ ...contactForm, email: event.target.value })
                }
                disabled={!canUpdate}
              />
            </label>
            <label>
              Réception formulaire
              <input
                value={contactForm.formRecipient}
                onChange={(event) =>
                  setContactForm({ ...contactForm, formRecipient: event.target.value })
                }
                disabled={!canUpdate}
              />
            </label>
          </div>
          <label>
            Adresse
            <input
              value={contactForm.address}
              onChange={(event) =>
                setContactForm({ ...contactForm, address: event.target.value })
              }
              disabled={!canUpdate}
            />
          </label>
          <label>
            Horaires
            <input
              value={contactForm.openingHours}
              onChange={(event) =>
                setContactForm({ ...contactForm, openingHours: event.target.value })
              }
              disabled={!canUpdate}
            />
          </label>
          <button className="primary-button" type="submit" disabled={!canUpdate || isSaving}>
            <Save aria-hidden="true" size={18} />
            Enregistrer les coordonnées
          </button>
        </form>

        <div className="landing-admin-panel">
          <div className="landing-admin-panel-title">
            <Globe2 aria-hidden="true" size={20} />
            <div>
              <h3>Structure commerciale</h3>
              <p>Canaux et packages disponibles dans la base.</p>
            </div>
          </div>
          <div className="landing-admin-metrics">
            <span>
              <strong>{content?.sections.length ?? 0}</strong>
              Sections
            </span>
            <span>
              <strong>{content?.channels.families.length ?? 0}</strong>
              Familles
            </span>
            <span>
              <strong>
                {content?.channels.families.reduce(
                  (total, family) => total + family.items.length,
                  0,
                ) ?? 0}
              </strong>
              Canaux
            </span>
            <span>
              <strong>{content?.pricingPackages.length ?? 0}</strong>
              Packages
            </span>
          </div>
          <div className="landing-admin-mini-list">
            {content?.pricingPackages.map((pricing) => (
              <div key={pricing.id}>
                <span>{pricing.name}</span>
                <strong>{pricing.price}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
