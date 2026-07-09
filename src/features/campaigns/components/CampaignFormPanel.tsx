import { Eye, Save, X } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { ContactList } from '../../contactLists/types/contactListTypes'
import type {
  ActiveMailProvider,
  CommunicationProvider,
} from '../../providers/types/providerTypes'
import type { EmailTemplate } from '../../templates/types/templateTypes'
import type {
  Campaign,
  CampaignChannel,
  CampaignChannelConfig,
  CampaignFormValues,
  CampaignPayload,
} from '../types/campaignTypes'

const campaignChannels: CampaignChannel[] = ['email', 'sms', 'whatsapp', 'telegram']

const defaultValues: CampaignFormValues = {
  name: '',
  subject: '',
  templateId: '',
  contactListId: '',
  channels: {
    email: {
      enabled: true,
      communicationProviderId: '',
      sendMode: 'single',
    },
    sms: {
      enabled: false,
      communicationProviderId: '',
      sendMode: 'single',
    },
    whatsapp: {
      enabled: false,
      communicationProviderId: '',
      sendMode: 'single',
    },
    telegram: {
      enabled: false,
      communicationProviderId: '',
      sendMode: 'single',
    },
  },
  scheduledAt: '',
}

type CampaignFormPanelProps = {
  campaign: Campaign | null
  activeMailProvider: ActiveMailProvider | null
  communicationProviders: CommunicationProvider[]
  contactLists: ContactList[]
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (payload: CampaignPayload) => Promise<void>
  templates: EmailTemplate[]
}

export function CampaignFormPanel({
  activeMailProvider,
  campaign,
  communicationProviders,
  contactLists,
  isSubmitting,
  onCancel,
  onSubmit,
  templates,
}: CampaignFormPanelProps) {
  const [values, setValues] = useState<CampaignFormValues>(defaultValues)
  const selectedTemplate = useMemo(
    () =>
      templates.find((template) => String(template.id) === values.templateId) ??
      null,
    [templates, values.templateId],
  )
  const previewHtml = useMemo(
    () =>
      selectedTemplate
        ? renderTemplatePreview(selectedTemplate.htmlContent)
        : null,
    [selectedTemplate],
  )

  useEffect(() => {
    if (!campaign) {
      setValues(defaultValues)
      return
    }

    const campaignChannelValues = buildChannelFormState(campaign)

    setValues({
      name: campaign.name,
      subject: campaign.subject,
      templateId: String(campaign.templateId),
      contactListId: String(campaign.contactListId),
      channels: campaignChannelValues,
      scheduledAt: campaign.scheduledAt
        ? campaign.scheduledAt.slice(0, 16)
        : '',
    })
  }, [campaign])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const channels = buildChannelPayload(values)
    const primaryChannel = getPrimaryChannel(channels)

    await onSubmit({
      name: values.name,
      subject: values.subject,
      templateId: Number(values.templateId),
      contactListId: Number(values.contactListId),
      channel: primaryChannel.channel,
      communicationProviderId: primaryChannel.communicationProviderId,
      sendMode: primaryChannel.sendMode,
      channels,
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

  function toggleChannel(channel: CampaignChannel) {
    setValues((current) => {
      const enabledChannels = campaignChannels.filter(
        (item) => current.channels[item].enabled,
      )
      const isLastEnabled =
        current.channels[channel].enabled && enabledChannels.length === 1

      if (isLastEnabled) return current

      return {
        ...current,
        channels: {
          ...current.channels,
          [channel]: {
            ...current.channels[channel],
            enabled: !current.channels[channel].enabled,
          },
        },
      }
    })
  }

  function updateChannelField(
    channel: CampaignChannel,
    patch: Partial<CampaignFormValues['channels'][CampaignChannel]>,
  ) {
    setValues((current) => ({
      ...current,
      channels: {
        ...current.channels,
        [channel]: {
          ...current.channels[channel],
          ...patch,
        },
      },
    }))
  }

  function getActiveChannelProviders(channel: CampaignChannel) {
    return communicationProviders.filter(
      (provider) => provider.channel === channel && provider.isActive,
    )
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

      <div className="campaign-form-layout">
        <form className="stack-form" onSubmit={handleSubmit}>
          <div className="campaign-channel-grid">
            {campaignChannels.map((channel) => (
              <button
                className={values.channels[channel].enabled ? 'active' : ''}
                key={channel}
                onClick={() => toggleChannel(channel)}
                type="button"
              >
                <strong>{formatChannelLabel(channel)}</strong>
                <span>{getChannelDescription(channel)}</span>
              </button>
            ))}
          </div>

          {values.channels.email.enabled ? (
            <div className="campaign-provider-summary">
              <span>Provider email actif *</span>
              <strong>{activeMailProvider?.name ?? 'Non configuré'}</strong>
            </div>
          ) : null}

          <div className="campaign-channel-configs">
            {campaignChannels
              .filter((channel) => values.channels[channel].enabled)
              .map((channel) => {
                const activeProviders = getActiveChannelProviders(channel)

                if (channel === 'email') {
                  return (
                    <label className="field" key={channel}>
                      <span>Mode d’envoi Postmark *</span>
                      <select
                        onChange={(event) =>
                          updateChannelField('email', {
                            sendMode: event.target
                              .value as CampaignFormValues['channels']['email']['sendMode'],
                          })
                        }
                        required
                        value={values.channels.email.sendMode}
                      >
                        <option value="single">
                          Classique · /email contact par contact
                        </option>
                        <option value="bulk">
                          Bulk · /email/bulk campagne groupée
                        </option>
                      </select>
                    </label>
                  )
                }

                return (
                  <label className="field" key={channel}>
                    <span>Provider {formatChannelLabel(channel)} actif *</span>
                    <select
                      onChange={(event) =>
                        updateChannelField(channel, {
                          communicationProviderId: event.target.value,
                        })
                      }
                      required
                      value={values.channels[channel].communicationProviderId}
                    >
                      <option value="">Sélectionner le provider actif</option>
                      {activeProviders.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name} · {provider.providerKey}
                        </option>
                      ))}
                    </select>
                  </label>
                )
              })}
          </div>

          {campaignChannels.some(
            (channel) => channel !== 'email' && values.channels[channel].enabled,
          ) ? (
            <div className="form-alert neutral-alert">
              Les canaux SMS, WhatsApp et Telegram utilisent leurs providers
              actifs. WhatsApp supporte Wassenger avec limitation de débit et
              personnalisation par contact.
            </div>
          ) : null}

          <div className="form-alert neutral-alert">
            Les variables sont remplacées pour chaque contact : {'{{fullName}}'},{' '}
            {'{{nomPrenoms}}'}, {'{{email}}'}, {'{{mobileNumber}}'},{' '}
            {'{{numeroMobile}}'}, {'{{commune}}'}, {'{{country}}'}, {'{{pays}}'}.
          </div>

          <label className="field">
            <span>Nom de la campagne *</span>
            <input
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="Promo lancement juillet"
              required
              value={values.name}
            />
          </label>

          <label className="field">
            <span>Objet de l’email *</span>
            <input
              onChange={(event) => updateField('subject', event.target.value)}
              placeholder="Une offre spéciale pour {{fullName}}"
              required
              value={values.subject}
            />
          </label>

          <label className="field">
            <span>Template email *</span>
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
            <span>Liste de contacts *</span>
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

        <section className="campaign-template-preview-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Aperçu</p>
              <h2>{selectedTemplate?.name ?? 'Template email'}</h2>
            </div>
            <Eye size={20} />
          </div>

          {selectedTemplate && previewHtml ? (
            <>
              <div className="campaign-template-preview-meta">
                <span>Objet</span>
                <strong>{values.subject || selectedTemplate.subject}</strong>
              </div>
              <iframe
                className="campaign-template-preview-frame"
                sandbox=""
                srcDoc={previewHtml}
                title={`Aperçu du template ${selectedTemplate.name}`}
              />
            </>
          ) : (
            <div className="empty-state compact-empty">
              <strong>Sélectionnez un template</strong>
              <span>L’aperçu de l’email s’affichera ici.</span>
            </div>
          )}
        </section>
      </div>
    </aside>
  )
}

function formatChannelLabel(channel: CampaignChannel) {
  const labels: Record<CampaignChannel, string> = {
    email: 'Email',
    sms: 'SMS',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
  }

  return labels[channel]
}

function getChannelDescription(channel: CampaignChannel) {
  const descriptions: Record<CampaignChannel, string> = {
    email: 'Templates HTML et provider email actif',
    sms: 'Provider SMS actif et quotas',
    whatsapp: 'Provider WhatsApp actif et variables',
    telegram: 'Provider Telegram actif et variables',
  }

  return descriptions[channel]
}

function buildChannelFormState(campaign: Campaign): CampaignFormValues['channels'] {
  const channels = createDefaultChannelState()
  const savedChannels =
    campaign.channels && campaign.channels.length > 0
      ? campaign.channels
      : [
          {
            channel: campaign.channel,
            communicationProviderId: campaign.communicationProviderId,
            sendMode: campaign.sendMode,
          },
        ]

  for (const savedChannel of savedChannels) {
    channels[savedChannel.channel] = {
      enabled: true,
      communicationProviderId: savedChannel.communicationProviderId
        ? String(savedChannel.communicationProviderId)
        : '',
      sendMode: savedChannel.sendMode ?? 'single',
    }
  }

  return channels
}

function createDefaultChannelState(): CampaignFormValues['channels'] {
  return {
    email: { ...defaultValues.channels.email },
    sms: { ...defaultValues.channels.sms },
    whatsapp: { ...defaultValues.channels.whatsapp },
    telegram: { ...defaultValues.channels.telegram },
  }
}

function buildChannelPayload(values: CampaignFormValues): CampaignChannelConfig[] {
  return campaignChannels
    .filter((channel) => values.channels[channel].enabled)
    .map((channel) => ({
      channel,
      communicationProviderId:
        channel === 'email'
          ? null
          : Number(values.channels[channel].communicationProviderId),
      sendMode: values.channels[channel].sendMode,
    }))
}

function getPrimaryChannel(channels: CampaignChannelConfig[]) {
  return (
    channels.find((channel) => channel.channel === 'email') ??
    channels[0] ?? {
      channel: 'email' as CampaignChannel,
      communicationProviderId: null,
      sendMode: 'single' as const,
    }
  )
}

function renderTemplatePreview(html: string) {
  const variables: Record<string, string> = {
    commune: 'Cocody',
    country: 'Côte d’Ivoire',
    email: 'awa.kone@example.com',
    firstName: 'Awa',
    fullName: 'Awa Koné',
    lastName: 'Koné',
    mobileNumber: '+225 07 00 00 00 00',
    unsubscribeUrl: 'https://top-teaser.com/unsubscribe/demo-token',
  }

  return Object.entries(variables).reduce(
    (content, [key, value]) =>
      content.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value),
    html,
  )
}
