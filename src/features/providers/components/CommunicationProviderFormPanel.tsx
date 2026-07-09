import { Plus, Save, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import type {
  CommunicationChannel,
  CommunicationProvider,
  CommunicationProviderPayload,
  CommunicationProviderVariable,
} from '../types/providerTypes'

type CommunicationProviderFormPanelProps = {
  channel: Exclude<CommunicationChannel, 'email'>
  isSubmitting: boolean
  onSubmit: (payload: CommunicationProviderPayload) => Promise<void>
  provider: CommunicationProvider | null
}

const defaultVariable: CommunicationProviderVariable = {
  key: 'api_key',
  label: 'Clé API',
  required: true,
  secret: true,
  value: '',
}

function getDefaultVariables(
  channel: Exclude<CommunicationChannel, 'email'>,
): CommunicationProviderVariable[] {
  const defaults: Record<
    Exclude<CommunicationChannel, 'email'>,
    CommunicationProviderVariable[]
  > = {
    sms: [
      { key: 'api_url', label: 'URL API', required: true, secret: false, value: '' },
      { key: 'api_key', label: 'Clé API', required: true, secret: true, value: '' },
      { key: 'sender', label: 'Expéditeur', required: false, secret: false, value: '' },
    ],
    whatsapp: [
      { key: 'base_url', label: 'URL API', required: true, secret: false, value: 'https://api.wassenger.com/v1' },
      { key: 'api_token', label: 'Token API Wassenger', required: true, secret: true, value: '' },
      { key: 'device_id', label: 'Device ID WhatsApp', required: true, secret: true, value: '' },
      { key: 'media_file_id', label: 'Fichier média Wassenger', required: false, secret: false, value: '' },
    ],
    telegram: [
      { key: 'bot_token', label: 'Token du bot', required: true, secret: true, value: '' },
      { key: 'chat_id', label: 'Chat ID ou modèle', required: false, secret: false, value: '{{mobileNumber}}' },
      { key: 'parse_mode', label: 'Mode de formatage', required: false, secret: false, value: '' },
    ],
  }

  return defaults[channel].map((variable) => ({ ...variable }))
}

function getChannelLabel(channel: Exclude<CommunicationChannel, 'email'>) {
  const labels: Record<Exclude<CommunicationChannel, 'email'>, string> = {
    sms: 'SMS',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
  }

  return labels[channel]
}

function getProviderPlaceholder(channel: Exclude<CommunicationChannel, 'email'>) {
  const placeholders: Record<Exclude<CommunicationChannel, 'email'>, string> = {
    sms: 'Twilio SMS',
    whatsapp: 'Wassenger WhatsApp',
    telegram: 'Telegram Bot',
  }

  return placeholders[channel]
}

function getProviderKeyPlaceholder(channel: Exclude<CommunicationChannel, 'email'>) {
  const placeholders: Record<Exclude<CommunicationChannel, 'email'>, string> = {
    sms: 'twilio',
    whatsapp: 'wassenger',
    telegram: 'telegram-bot',
  }

  return placeholders[channel]
}

export function CommunicationProviderFormPanel({
  channel,
  isSubmitting,
  onSubmit,
  provider,
}: CommunicationProviderFormPanelProps) {
  const [values, setValues] = useState<CommunicationProviderPayload>({
    channel,
    name: '',
    providerKey: '',
    isActive: false,
    variables: getDefaultVariables(channel),
    limits: {
      batchSize: channel === 'whatsapp' ? 2000 : 100,
      maxPerDay: channel === 'whatsapp' ? 20000 : 10000,
      maxPerHour: channel === 'whatsapp' ? 6000 : 1000,
      maxPerMinute: channel === 'whatsapp' ? 100 : 60,
    },
  })

  useEffect(() => {
    if (!provider) {
      setValues((current) => ({
        ...current,
        channel,
        variables: getDefaultVariables(channel),
        limits: {
          batchSize: channel === 'whatsapp' ? 2000 : 100,
          maxPerDay: channel === 'whatsapp' ? 20000 : 10000,
          maxPerHour: channel === 'whatsapp' ? 6000 : 1000,
          maxPerMinute: channel === 'whatsapp' ? 100 : 60,
        },
      }))
      return
    }

    setValues({
      channel: provider.channel,
      name: provider.name,
      providerKey: provider.providerKey,
      isActive: provider.isActive,
      variables:
        provider.variables.length > 0
          ? provider.variables
          : getDefaultVariables(channel),
      limits: provider.limits,
    })
  }, [channel, provider])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit(values)
  }

  function updateVariable(
    index: number,
    patch: Partial<CommunicationProviderVariable>,
  ) {
    setValues((current) => ({
      ...current,
      variables: current.variables.map((variable, candidateIndex) =>
        candidateIndex === index ? { ...variable, ...patch } : variable,
      ),
    }))
  }

  return (
    <aside className="provider-settings-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{getChannelLabel(channel)}</p>
          <h2>{provider ? 'Modifier le provider' : 'Nouveau provider'}</h2>
        </div>
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        <div className="split-fields">
          <label className="field">
            <span>Nom du provider</span>
            <input
              onChange={(event) =>
                setValues((current) => ({ ...current, name: event.target.value }))
              }
              placeholder={getProviderPlaceholder(channel)}
              required
              value={values.name}
            />
          </label>

          <label className="field">
            <span>Identifiant technique</span>
            <input
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  providerKey: event.target.value,
                }))
              }
              placeholder={getProviderKeyPlaceholder(channel)}
              required
              value={values.providerKey}
            />
          </label>
        </div>

        <label className="toggle-field provider-active-toggle">
          <span>Définir comme provider actif pour ce canal</span>
          <input
            checked={values.isActive}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                isActive: event.target.checked,
              }))
            }
            type="checkbox"
          />
        </label>

        <div className="provider-dynamic-section">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Variables</p>
              <h2>Configuration dynamique</h2>
            </div>
            <button
              className="secondary-button"
              onClick={() =>
                setValues((current) => ({
                  ...current,
                  variables: [...current.variables, { ...defaultVariable, key: '' }],
                }))
              }
              type="button"
            >
              <Plus size={16} />
              Ajouter
            </button>
          </div>

          {values.variables.map((variable, index) => (
            <div className="provider-variable-row" key={index}>
              <input
                onChange={(event) =>
                  updateVariable(index, { key: event.target.value })
                }
                placeholder="api_key"
                required
                value={variable.key}
              />
              <input
                onChange={(event) =>
                  updateVariable(index, { label: event.target.value })
                }
                placeholder="Libellé"
                required
                value={variable.label}
              />
              <input
                onChange={(event) =>
                  updateVariable(index, { value: event.target.value })
                }
                placeholder="Valeur"
                type={variable.secret ? 'password' : 'text'}
                value={variable.value ?? ''}
              />
              <label>
                <input
                  checked={variable.secret}
                  onChange={(event) =>
                    updateVariable(index, { secret: event.target.checked })
                  }
                  type="checkbox"
                />
                Secret
              </label>
              <label>
                <input
                  checked={variable.required}
                  onChange={(event) =>
                    updateVariable(index, { required: event.target.checked })
                  }
                  type="checkbox"
                />
                Requis
              </label>
              <button
                aria-label="Supprimer la variable"
                className="icon-button danger"
                disabled={values.variables.length === 1}
                onClick={() =>
                  setValues((current) => ({
                    ...current,
                    variables: current.variables.filter(
                      (_item, candidateIndex) => candidateIndex !== index,
                    ),
                  }))
                }
                type="button"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="split-fields">
          <label className="field">
            <span>Maximum par minute</span>
            <input
              min={1}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  limits: {
                    ...current.limits,
                    maxPerMinute: Number(event.target.value),
                  },
                }))
              }
              type="number"
              value={values.limits.maxPerMinute}
            />
          </label>

          <label className="field">
            <span>Maximum par heure</span>
            <input
              min={1}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  limits: {
                    ...current.limits,
                    maxPerHour: Number(event.target.value),
                  },
                }))
              }
              type="number"
              value={values.limits.maxPerHour}
            />
          </label>
        </div>

        <div className="split-fields">
          <label className="field">
            <span>Maximum par jour</span>
            <input
              min={1}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  limits: {
                    ...current.limits,
                    maxPerDay: Number(event.target.value),
                  },
                }))
              }
              type="number"
              value={values.limits.maxPerDay}
            />
          </label>

          <label className="field">
            <span>Taille des lots</span>
            <input
              min={1}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  limits: {
                    ...current.limits,
                    batchSize: Number(event.target.value),
                  },
                }))
              }
              type="number"
              value={values.limits.batchSize}
            />
          </label>
        </div>

        <button className="primary-button" disabled={isSubmitting} type="submit">
          <Save size={18} />
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer le provider'}
        </button>
      </form>
    </aside>
  )
}
