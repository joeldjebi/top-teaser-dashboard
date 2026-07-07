import { Save, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import type {
  ContactList,
  ContactListFormValues,
  ContactListPayload,
} from '../types/contactListTypes'

const defaultValues: ContactListFormValues = {
  name: '',
  description: '',
}

type ContactListFormPanelProps = {
  contactList: ContactList | null
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (payload: ContactListPayload) => Promise<void>
}

export function ContactListFormPanel({
  contactList,
  isSubmitting,
  onCancel,
  onSubmit,
}: ContactListFormPanelProps) {
  const [values, setValues] = useState<ContactListFormValues>(defaultValues)

  useEffect(() => {
    if (!contactList) {
      setValues(defaultValues)
      return
    }

    setValues({
      name: contactList.name,
      description: contactList.description ?? '',
    })
  }, [contactList])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await onSubmit({
      name: values.name,
      description: values.description.trim() || null,
    })

    if (!contactList) {
      setValues(defaultValues)
    }
  }

  return (
    <aside className="contact-list-form-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Liste de contacts</p>
          <h2>{contactList ? 'Modifier la liste' : 'Nouvelle liste'}</h2>
        </div>
        <button
          aria-label="Fermer le formulaire"
          className="icon-button soft"
          onClick={onCancel}
          type="button"
        >
          <X size={18} />
        </button>
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Nom de la liste</span>
          <input
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Clients premium, Prospects Abidjan..."
            required
            value={values.name}
          />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="Expliquez à quoi sert cette catégorie."
            rows={4}
            value={values.description}
          />
        </label>

        <button className="primary-button" disabled={isSubmitting} type="submit">
          <Save size={18} />
          {isSubmitting
            ? 'Enregistrement...'
            : contactList
              ? 'Mettre à jour'
              : 'Créer la liste'}
        </button>
      </form>
    </aside>
  )
}
