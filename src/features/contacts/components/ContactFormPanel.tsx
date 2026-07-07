import { Save, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import type {
  Contact,
  ContactFormValues,
  ContactPayload,
  ContactStatus,
} from '../types/contactTypes'

const defaultValues: ContactFormValues = {
  email: '',
  fullName: '',
  mobileNumber: '',
  commune: '',
  country: '',
  status: 'active',
}

type ContactFormPanelProps = {
  contact: Contact | null
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (payload: ContactPayload) => Promise<void>
}

export function ContactFormPanel({
  contact,
  isSubmitting,
  onCancel,
  onSubmit,
}: ContactFormPanelProps) {
  const [values, setValues] = useState<ContactFormValues>(defaultValues)

  useEffect(() => {
    if (!contact) {
      setValues(defaultValues)
      return
    }

    setValues({
      email: contact.email,
      fullName: contact.fullName ?? '',
      mobileNumber: contact.mobileNumber ?? '',
      commune: contact.commune ?? '',
      country: contact.country ?? '',
      status: contact.status,
    })
  }, [contact])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit({
      email: values.email,
      fullName: values.fullName || null,
      mobileNumber: values.mobileNumber || null,
      commune: values.commune || null,
      country: values.country || null,
      status: values.status,
    })

    if (!contact) {
      setValues(defaultValues)
    }
  }

  function updateField<Key extends keyof ContactFormValues>(
    key: Key,
    value: ContactFormValues[Key],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }))
  }

  return (
    <aside className="contact-form-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Contact</p>
          <h2>{contact ? 'Modifier le contact' : 'Nouveau contact'}</h2>
        </div>
        {contact ? (
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
        <span>Adresse email</span>
          <input
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="client@example.com"
            required
            type="email"
            value={values.email}
          />
        </label>

        <div className="split-fields">
          <label className="field">
            <span>Nom et prénoms</span>
            <input
              onChange={(event) => updateField('fullName', event.target.value)}
              placeholder="Awa Koné"
              type="text"
              value={values.fullName}
            />
          </label>

          <label className="field">
            <span>Numéro mobile</span>
            <input
              onChange={(event) => updateField('mobileNumber', event.target.value)}
              placeholder="+225 07 00 00 00 00"
              type="tel"
              value={values.mobileNumber}
            />
          </label>
        </div>

        <div className="split-fields">
          <label className="field">
            <span>Commune</span>
            <input
              onChange={(event) => updateField('commune', event.target.value)}
              placeholder="Cocody"
              type="text"
              value={values.commune}
            />
          </label>

          <label className="field">
            <span>Pays</span>
            <input
              onChange={(event) => updateField('country', event.target.value)}
              placeholder="Côte d’Ivoire"
              type="text"
              value={values.country}
            />
          </label>
        </div>

        <label className="field">
          <span>Statut</span>
          <select
            onChange={(event) =>
              updateField('status', event.target.value as ContactStatus)
            }
            value={values.status}
          >
            <option value="active">Actif</option>
            <option value="invalid">Invalide</option>
            <option value="bounced">Bounce</option>
            <option value="unsubscribed">Désabonné</option>
          </select>
        </label>

        <button className="primary-button" disabled={isSubmitting} type="submit">
          <Save size={18} />
          {isSubmitting ? 'Enregistrement...' : contact ? 'Mettre à jour' : 'Créer'}
        </button>
      </form>
    </aside>
  )
}
