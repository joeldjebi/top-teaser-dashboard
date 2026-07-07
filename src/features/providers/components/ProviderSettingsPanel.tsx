import { Save } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import type {
  MailProvider,
  MailSettings,
  MailSettingsPayload,
  ProviderSettingsFormValues,
} from '../types/providerTypes'

type ProviderSettingsPanelProps = {
  isSubmitting: boolean
  onSubmit: (payload: MailSettingsPayload) => Promise<void>
  providers: MailProvider[]
  settings: MailSettings | null
}

export function ProviderSettingsPanel({
  isSubmitting,
  onSubmit,
  providers,
  settings,
}: ProviderSettingsPanelProps) {
  const [values, setValues] = useState<ProviderSettingsFormValues>({
    provider: 'postmark',
    from: '',
    config: {},
  })

  useEffect(() => {
    if (!settings) {
      return
    }

    const nextConfig = settings.providers.reduce<Record<string, string>>(
      (config, provider) => {
        provider.fields.forEach((field) => {
          config[field.key] = field.value ?? ''
        })

        return config
      },
      {},
    )

    setValues({
      provider: settings.activeProvider,
      from: settings.from,
      config: nextConfig,
    })
  }, [settings])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit(values)
  }

  return (
    <aside className="provider-settings-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Configuration</p>
          <h2>Paramètres d’envoi</h2>
        </div>
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Provider actif</span>
          <select
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                provider: event.target.value as ProviderSettingsFormValues['provider'],
              }))
            }
            value={values.provider}
          >
            {providers.map((provider) => (
              <option key={provider.key} value={provider.key}>
                {provider.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Email expéditeur</span>
          <input
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                from: event.target.value,
              }))
            }
            placeholder="no-reply@votre-domaine.com"
            required
            type="email"
            value={values.from}
          />
        </label>

        <div className="provider-config-stack">
          {settings?.providers.map((providerSettings) => {
            const provider = providers.find(
              (candidate) => candidate.key === providerSettings.key,
            )
            const isActive = values.provider === providerSettings.key

            return (
              <section
                className={`provider-config-group ${isActive ? 'active' : ''}`}
                key={providerSettings.key}
              >
                <div className="provider-config-heading">
                  <div>
                    <p className="eyebrow">{providerSettings.key}</p>
                    <h3>{provider?.name ?? providerSettings.key}</h3>
                  </div>
                  {isActive ? <span>Actif</span> : null}
                </div>

                {providerSettings.fields.map((field) =>
                  field.inputType === 'switch' ? (
                    <label className="toggle-field" key={field.key}>
                      <span>{field.label}</span>
                      <input
                        checked={(values.config[field.key] ?? 'false') === 'true'}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            config: {
                              ...current.config,
                              [field.key]: event.target.checked ? 'true' : 'false',
                            },
                          }))
                        }
                        type="checkbox"
                      />
                    </label>
                  ) : (
                    <label className="field" key={field.key}>
                      <span>
                        {field.label}
                        {field.secret && field.configured ? ' déjà configuré' : ''}
                      </span>
                      <input
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            config: {
                              ...current.config,
                              [field.key]: event.target.value,
                            },
                          }))
                        }
                        placeholder={
                          field.secret && field.configured
                            ? 'Laisser vide pour conserver la valeur'
                            : field.label
                        }
                        type={field.secret ? 'password' : 'text'}
                        value={values.config[field.key] ?? ''}
                      />
                    </label>
                  ),
                )}
              </section>
            )
          })}
        </div>

        <button className="primary-button" disabled={isSubmitting} type="submit">
          <Save size={18} />
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer la configuration'}
        </button>
      </form>
    </aside>
  )
}
