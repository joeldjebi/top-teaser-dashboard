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
      templateId: '',
      sendMode: 'single',
    },
    sms: {
      enabled: false,
      communicationProviderId: '',
      templateId: '',
      sendMode: 'single',
    },
    whatsapp: {
      enabled: false,
      communicationProviderId: '',
      templateId: '',
      sendMode: 'single',
    },
    telegram: {
      enabled: false,
      communicationProviderId: '',
      templateId: '',
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
    () => getPreviewTemplate(values, templates),
    [templates, values],
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
    const primaryTemplateId = primaryChannel.templateId ?? Number(values.templateId)

    await onSubmit({
      name: values.name,
      subject: values.subject,
      templateId: primaryTemplateId,
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
            communicationProviderId:
              current.channels[channel].communicationProviderId ||
              getDefaultProviderId(channel, communicationProviders),
            templateId:
              current.channels[channel].templateId ||
              templates.find((template) => template.channel === channel)?.id.toString() ||
              '',
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

  function getChannelTemplates(channel: CampaignChannel) {
    return templates.filter((template) => template.channel === channel)
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
                    <div className="campaign-channel-config-card" key={channel}>
                      <label className="field">
                        <span>Template Email *</span>
                        <select
                          onChange={(event) =>
                            updateChannelField('email', {
                              templateId: event.target.value,
                            })
                          }
                          required
                          value={values.channels.email.templateId}
                        >
                          <option value="">Sélectionner un template email</option>
                          {getChannelTemplates('email').map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="field">
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
                    </div>
                  )
                }

                return (
                  <div className="campaign-channel-config-card" key={channel}>
                    <div className="channel-config-heading">
                      <strong>{formatChannelLabel(channel)}</strong>
                      <span>{getProviderHint(channel, activeProviders)}</span>
                    </div>
                    <label className="field">
                      <span>Template {formatChannelLabel(channel)} *</span>
                      <select
                        onChange={(event) =>
                          updateChannelField(channel, {
                            templateId: event.target.value,
                          })
                        }
                        required
                        value={values.channels[channel].templateId}
                      >
                        <option value="">
                          Sélectionner un template {formatChannelLabel(channel)}
                        </option>
                        {getChannelTemplates(channel).map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
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
                  </div>
                )
              })}
          </div>

          {values.channels.whatsapp.enabled ? (
            <div className="form-alert neutral-alert">
              Pour Wassenger, sélectionnez le template WhatsApp
              top_teaser_campagne et le provider actif configuré avec
              device_id, waba_template_name=top_teaser_campagne,
              waba_template_language=fr et waba_template_button_variables=1=offerUrl.
              Dans Wassenger, le premier bouton est en position 0 ; ici `1`
              désigne la variable Meta {'{{1}}'} du bouton.
            </div>
          ) : null}

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
            <span>Objet / libellé de campagne *</span>
            <input
              onChange={(event) => updateField('subject', event.target.value)}
              placeholder="Une offre spéciale pour {{fullName}}"
              required
              value={values.subject}
            />
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
              <h2>{selectedTemplate?.name ?? 'Template'}</h2>
            </div>
            <Eye size={20} />
          </div>

          {selectedTemplate && previewHtml ? (
            <>
              <div className="campaign-template-preview-meta">
                <span>{selectedTemplate.channel === 'email' ? 'Objet' : 'Canal'}</span>
                <strong>{values.subject || selectedTemplate.subject}</strong>
              </div>
              {selectedTemplate.channel === 'email' ? (
                <iframe
                  className="campaign-template-preview-frame"
                  sandbox=""
                  srcDoc={previewHtml}
                  title={`Aperçu du template ${selectedTemplate.name}`}
                />
              ) : (
                <pre className="campaign-message-preview">{previewHtml}</pre>
              )}
            </>
          ) : (
            <div className="empty-state compact-empty">
              <strong>Sélectionnez un template</strong>
              <span>L’aperçu du message s’affichera ici.</span>
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
            templateId: campaign.templateId,
            sendMode: campaign.sendMode,
          },
        ]

  for (const savedChannel of savedChannels) {
    channels[savedChannel.channel] = {
      enabled: true,
      communicationProviderId: savedChannel.communicationProviderId
        ? String(savedChannel.communicationProviderId)
        : '',
      templateId: savedChannel.templateId
        ? String(savedChannel.templateId)
        : String(campaign.templateId),
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
      templateId: Number(values.channels[channel].templateId),
      sendMode: values.channels[channel].sendMode,
    }))
}

function getPrimaryChannel(channels: CampaignChannelConfig[]) {
  return (
    channels.find((channel) => channel.channel === 'email') ??
    channels[0] ?? {
      channel: 'email' as CampaignChannel,
      communicationProviderId: null,
      templateId: null,
      sendMode: 'single' as const,
    }
  )
}

function getPreviewTemplate(
  values: CampaignFormValues,
  templates: EmailTemplate[],
) {
  const selectedChannel =
    campaignChannels.find(
      (channel) =>
        values.channels[channel].enabled &&
        values.channels[channel].templateId.length > 0,
    ) ?? 'email'
  const templateId =
    values.channels[selectedChannel]?.templateId || values.templateId

  return templates.find((template) => String(template.id) === templateId) ?? null
}

function renderTemplatePreview(html: string) {
  const variables: Record<string, string> = {
    buttonUrl: 'https://top-teaser.com/offre',
    commune: 'Cocody',
    country: 'Côte d’Ivoire',
    email: 'awa.kone@example.com',
    firstName: 'Awa',
    fullName: 'Awa Koné',
    lastName: 'Koné',
    mobileNumber: '+225 07 00 00 00 00',
    nomPrenoms: 'Awa Koné',
    numeroMobile: '+225 07 00 00 00 00',
    offerUrl: 'https://top-teaser.com/offre',
    pays: 'Côte d’Ivoire',
    telephone: '+225 07 00 00 00 00',
    unsubscribeUrl: 'https://top-teaser.com/unsubscribe/demo-token',
    url: 'https://top-teaser.com/offre',
  }

  return Object.entries(variables).reduce(
    (content, [key, value]) =>
      content.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value),
    html,
  )
}

function getDefaultProviderId(
  channel: CampaignChannel,
  communicationProviders: CommunicationProvider[],
) {
  if (channel === 'email') return ''

  return (
    communicationProviders
      .find((provider) => provider.channel === channel && provider.isActive)
      ?.id.toString() ?? ''
  )
}

function getProviderHint(
  channel: CampaignChannel,
  activeProviders: CommunicationProvider[],
) {
  const activeProvider = activeProviders[0]

  if (!activeProvider) {
    return `Aucun provider ${formatChannelLabel(channel)} actif`
  }

  if (
    channel === 'whatsapp' &&
    activeProvider.providerKey.trim().toLowerCase() === 'wassenger'
  ) {
    return 'Wassenger · Template Meta/WABA'
  }

  return `${activeProvider.name} · ${activeProvider.providerKey}`
}
