import { Save, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import type { ContactList } from '../../contactLists/types/contactListTypes'
import type { EmailTemplate } from '../../templates/types/templateTypes'
import type {
  Campaign,
  CampaignFormValues,
  CampaignPayload,
} from '../types/campaignTypes'

const defaultValues: CampaignFormValues = {
  name: '',
  subject: '',
  templateId: '',
  contactListId: '',
  sendMode: 'single',
  scheduledAt: '',
}

type CampaignFormPanelProps = {
  campaign: Campaign | null
  contactLists: ContactList[]
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (payload: CampaignPayload) => Promise<void>
  templates: EmailTemplate[]
}

export function CampaignFormPanel({
  campaign,
  contactLists,
  isSubmitting,
  onCancel,
  onSubmit,
  templates,
}: CampaignFormPanelProps) {
  const [values, setValues] = useState<CampaignFormValues>(defaultValues)

  useEffect(() => {
    if (!campaign) {
      setValues(defaultValues)
      return
    }

    setValues({
      name: campaign.name,
      subject: campaign.subject,
      templateId: String(campaign.templateId),
      contactListId: String(campaign.contactListId),
      sendMode: campaign.sendMode ?? 'single',
      scheduledAt: campaign.scheduledAt
        ? campaign.scheduledAt.slice(0, 16)
        : '',
    })
  }, [campaign])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await onSubmit({
      name: values.name,
      subject: values.subject,
      templateId: Number(values.templateId),
      contactListId: Number(values.contactListId),
      sendMode: values.sendMode,
      scheduledAt: values.scheduledAt
        ? new Date(values.scheduledAt).toISOString()
        : null,
    })

    if (!campaign) {
      setValues(defaultValues)
    }
  }

  function updateField<Key extends keyof CampaignFormValues>(
    key: Key,
    value: CampaignFormValues[Key],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }))
  }

  return (
    <aside className="campaign-form-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Campagne</p>
          <h2>{campaign ? 'Modifier la campagne' : 'Nouvelle campagne'}</h2>
        </div>
        {campaign ? (
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
          <span>Nom de la campagne</span>
          <input
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Promo lancement juillet"
            required
            value={values.name}
          />
        </label>

        <label className="field">
          <span>Objet de l’email</span>
          <input
            onChange={(event) => updateField('subject', event.target.value)}
            placeholder="Une offre spéciale pour {{fullName}}"
            required
            value={values.subject}
          />
        </label>

        <label className="field">
          <span>Template email</span>
          <select
            onChange={(event) => updateField('templateId', event.target.value)}
            required
            value={values.templateId}
          >
            <option value="">Sélectionner un template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Liste de contacts</span>
          <select
            onChange={(event) => updateField('contactListId', event.target.value)}
            required
            value={values.contactListId}
          >
            <option value="">Sélectionner une liste</option>
            {contactLists.map((contactList) => (
              <option key={contactList.id} value={contactList.id}>
                {contactList.name} · {contactList.contactsCount} contact(s)
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Mode d’envoi Postmark</span>
          <select
            onChange={(event) =>
              updateField(
                'sendMode',
                event.target.value as CampaignFormValues['sendMode'],
              )
            }
            required
            value={values.sendMode}
          >
            <option value="single">Classique · /email contact par contact</option>
            <option value="bulk">Bulk · /email/bulk campagne groupée</option>
          </select>
        </label>

        <label className="field">
          <span>Planification</span>
          <input
            onChange={(event) => updateField('scheduledAt', event.target.value)}
            type="datetime-local"
            value={values.scheduledAt}
          />
        </label>

        <button className="primary-button" disabled={isSubmitting} type="submit">
          <Save size={18} />
          {isSubmitting
            ? 'Enregistrement...'
            : campaign
              ? 'Mettre à jour'
              : 'Créer la campagne'}
        </button>
      </form>
    </aside>
  )
}
