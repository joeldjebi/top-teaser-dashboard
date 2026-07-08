import { Save, WandSparkles, X } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type {
  EmailTemplate,
  TemplateFormValues,
  TemplatePayload,
} from '../types/templateTypes'
import { buildLightweightTemplate } from '../utils/lightweightTemplateBuilder'

type GuidedTemplateValues = {
  name: string
  subject: string
  title: string
  message: string
  ctaLabel: string
  ctaUrl: string
  signature: string
}

const defaultValues: GuidedTemplateValues = {
  name: '',
  subject: 'Bonjour {{fullName}}, une information pour vous',
  title: 'Bonjour {{fullName}},',
  message:
    'Nous avons une information utile à partager avec vous à {{commune}}.\n\nAjoutez ici votre message principal en restant clair, court et direct.',
  ctaLabel: '',
  ctaUrl: '',
  signature: 'L’équipe Top Teaser',
}

type TemplateFormPanelProps = {
  initialValues?: TemplateFormValues
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (payload: TemplatePayload) => Promise<void>
  template: EmailTemplate | null
}

function valuesFromTemplate(template: EmailTemplate): GuidedTemplateValues {
  return {
    ...defaultValues,
    name: template.name,
    subject: template.subject,
    title: template.subject,
    message:
      template.textContent?.replace(/Se désabonner\s*:\s*\{\{unsubscribeUrl\}\}/g, '').trim() ||
      'Ajoutez ici votre message principal.',
  }
}

function valuesFromPreset(initialValues?: TemplateFormValues): GuidedTemplateValues {
  if (!initialValues) {
    return defaultValues
  }

  return {
    ...defaultValues,
    name: initialValues.name,
    subject: initialValues.subject,
    title: initialValues.subject,
    message:
      initialValues.textContent
        ?.replace(/Se désabonner\s*:\s*\{\{unsubscribeUrl\}\}/g, '')
        .trim() || defaultValues.message,
  }
}

export function TemplateFormPanel({
  initialValues,
  isSubmitting,
  onCancel,
  onSubmit,
  template,
}: TemplateFormPanelProps) {
  const [values, setValues] = useState<GuidedTemplateValues>(defaultValues)

  useEffect(() => {
    setValues(template ? valuesFromTemplate(template) : valuesFromPreset(initialValues))
  }, [initialValues, template])

  const generated = useMemo(
    () =>
      buildLightweightTemplate({
        title: values.title,
        message: values.message,
        ctaLabel: values.ctaLabel,
        ctaUrl: values.ctaUrl,
        signature: values.signature,
      }),
    [values.ctaLabel, values.ctaUrl, values.message, values.signature, values.title],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit({
      name: values.name,
      subject: values.subject,
      htmlContent: generated.html,
      textContent: generated.text,
    })

    if (!template) {
      setValues(defaultValues)
    }
  }

  function updateField<Key extends keyof GuidedTemplateValues>(
    key: Key,
    value: GuidedTemplateValues[Key],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }))
  }

  return (
    <aside className="template-form-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Éditeur guidé</p>
          <h2>{template ? 'Modifier le template' : 'Nouveau template'}</h2>
        </div>
        {template ? (
          <button
            aria-label="Annuler la modification"
            className="icon-button soft"
            onClick={onCancel}
            type="button"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        <div className="template-deliverability-note">
          <WandSparkles size={18} />
          <span>
            HTML léger généré automatiquement, version texte incluse et lien de
            désabonnement conservé.
          </span>
        </div>

        <label className="field">
          <span>Nom du template</span>
          <input
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Offre de bienvenue"
            required
            value={values.name}
          />
        </label>

        <label className="field">
          <span>Objet de l’email</span>
          <input
            onChange={(event) => updateField('subject', event.target.value)}
            placeholder="Bonjour {{fullName}}, une offre pour vous"
            required
            value={values.subject}
          />
        </label>

        <label className="field">
          <span>Titre visible dans l’email</span>
          <input
            onChange={(event) => updateField('title', event.target.value)}
            required
            value={values.title}
          />
        </label>

        <label className="field">
          <span>Message</span>
          <textarea
            onChange={(event) => updateField('message', event.target.value)}
            required
            rows={8}
            value={values.message}
          />
        </label>

        <div className="split-fields">
          <label className="field">
            <span>Bouton</span>
            <input
              onChange={(event) => updateField('ctaLabel', event.target.value)}
              placeholder="Voir l’offre"
              value={values.ctaLabel}
            />
          </label>
          <label className="field">
            <span>Lien du bouton</span>
            <input
              onChange={(event) => updateField('ctaUrl', event.target.value)}
              placeholder="https://example.com"
              type="url"
              value={values.ctaUrl}
            />
          </label>
        </div>

        <label className="field">
          <span>Signature</span>
          <input
            onChange={(event) => updateField('signature', event.target.value)}
            value={values.signature}
          />
        </label>

        <div className="template-generated-preview">
          <span>Poids estimé</span>
          <strong>{new Blob([generated.html]).size.toLocaleString('fr-FR')} octets</strong>
        </div>

        <button className="primary-button" disabled={isSubmitting} type="submit">
          <Save size={18} />
          {isSubmitting ? 'Enregistrement...' : template ? 'Mettre à jour' : 'Créer'}
        </button>
      </form>
    </aside>
  )
}
