import { Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type {
  MailTestPayload,
  ProviderTestFormValues,
} from '../types/providerTypes'

const defaultValues: ProviderTestFormValues = {
  email: '',
  name: '',
  subject: 'Top Teaser · Test provider',
  html:
    '<h1>Test Top Teaser</h1><p>Votre provider email actif fonctionne correctement.</p>',
  text: 'Test Top Teaser. Votre provider email actif fonctionne correctement.',
}

type ProviderTestPanelProps = {
  isSubmitting: boolean
  onSubmit: (payload: MailTestPayload) => Promise<void>
}

export function ProviderTestPanel({
  isSubmitting,
  onSubmit,
}: ProviderTestPanelProps) {
  const [values, setValues] = useState<ProviderTestFormValues>(defaultValues)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await onSubmit({
      to: {
        email: values.email,
        name: values.name || undefined,
      },
      subject: values.subject,
      html: values.html,
      text: values.text || undefined,
    })
  }

  function updateField<Key extends keyof ProviderTestFormValues>(
    key: Key,
    value: ProviderTestFormValues[Key],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }))
  }

  return (
    <aside className="provider-test-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Diagnostic</p>
          <h2>Tester l’envoi</h2>
        </div>
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email destinataire</span>
          <input
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="admin@example.com"
            required
            type="email"
            value={values.email}
          />
        </label>

        <label className="field">
          <span>Nom destinataire</span>
          <input
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Admin Top Teaser"
            value={values.name}
          />
        </label>

        <label className="field">
          <span>Objet</span>
          <input
            onChange={(event) => updateField('subject', event.target.value)}
            required
            value={values.subject}
          />
        </label>

        <label className="field">
          <span>HTML</span>
          <textarea
            className="code-textarea"
            onChange={(event) => updateField('html', event.target.value)}
            required
            rows={6}
            value={values.html}
          />
        </label>

        <label className="field">
          <span>Version texte</span>
          <textarea
            onChange={(event) => updateField('text', event.target.value)}
            rows={4}
            value={values.text}
          />
        </label>

        <button className="primary-button" disabled={isSubmitting} type="submit">
          <Send size={18} />
          {isSubmitting ? 'Envoi du test...' : 'Envoyer un test'}
        </button>
      </form>
    </aside>
  )
}
