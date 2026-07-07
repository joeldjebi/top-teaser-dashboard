import { Save, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import type {
  EmailTemplate,
  TemplateFormValues,
  TemplatePayload,
} from '../types/templateTypes'

const defaultValues: TemplateFormValues = {
  name: '',
  subject: '',
  htmlContent:
    '<h1>Bonjour {{fullName}}</h1><p>Nous avons une nouvelle information pour vous à {{commune}}.</p>',
  textContent:
    'Bonjour {{fullName}}, nous avons une nouvelle information pour vous à {{commune}}.',
}

type TemplateFormPanelProps = {
  initialValues?: TemplateFormValues
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (payload: TemplatePayload) => Promise<void>
  template: EmailTemplate | null
}

export function TemplateFormPanel({
  initialValues,
  isSubmitting,
  onCancel,
  onSubmit,
  template,
}: TemplateFormPanelProps) {
  const [values, setValues] = useState<TemplateFormValues>(defaultValues)

  useEffect(() => {
    if (!template) {
      setValues(initialValues ?? defaultValues)
      return
    }

    setValues({
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent ?? '',
    })
  }, [initialValues, template])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit({
      name: values.name,
      subject: values.subject,
      htmlContent: values.htmlContent,
      textContent: values.textContent || null,
    })

    if (!template) {
      setValues(defaultValues)
    }
  }

  function updateField<Key extends keyof TemplateFormValues>(
    key: Key,
    value: TemplateFormValues[Key],
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
          <p className="eyebrow">Template</p>
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
          <span>Contenu HTML</span>
          <textarea
            className="code-textarea"
            onChange={(event) => updateField('htmlContent', event.target.value)}
            required
            rows={9}
            value={values.htmlContent}
          />
        </label>

        <label className="field">
          <span>Version texte</span>
          <textarea
            onChange={(event) => updateField('textContent', event.target.value)}
            rows={5}
            value={values.textContent}
          />
        </label>

        <button className="primary-button" disabled={isSubmitting} type="submit">
          <Save size={18} />
          {isSubmitting ? 'Enregistrement...' : template ? 'Mettre à jour' : 'Créer'}
        </button>
      </form>
    </aside>
  )
}
