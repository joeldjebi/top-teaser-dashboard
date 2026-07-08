import { Save, X } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Country } from '../../locations/types/locationTypes'
import type {
  Contact,
  ContactFormValues,
  ContactPayload,
} from '../types/contactTypes'

const defaultValues: ContactFormValues = {
  email: '',
  fullName: '',
  mobileNumber: '',
  commune: '',
  country: '',
}

type ContactFormPanelProps = {
  contact: Contact | null
  countries: Country[]
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (payload: ContactPayload) => Promise<void>
}

export function ContactFormPanel({
  contact,
  countries,
  isSubmitting,
  onCancel,
  onSubmit,
}: ContactFormPanelProps) {
  const [values, setValues] = useState<ContactFormValues>(defaultValues)
  const selectedCountry = useMemo(
    () => countries.find((country) => country.name === values.country) ?? null,
    [countries, values.country],
  )
  const hasCurrentCountryOption = countries.some(
    (country) => country.name === values.country,
  )
  const hasCurrentCommuneOption = Boolean(
    selectedCountry?.communes.some((commune) => commune.name === values.commune),
  )

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
    })
  }, [contact])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit({
      email: values.email,
      fullName: values.fullName || null,
      mobileNumber: values.mobileNumber,
      commune: values.commune || null,
      country: values.country || null,
      status: contact ? undefined : 'active',
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

  function updateCountry(countryName: string) {
    setValues((current) => ({
      ...current,
      country: countryName,
      commune: '',
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
          <span>Adresse email *</span>
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
            <span>Numéro mobile *</span>
            <input
              onChange={(event) => updateField('mobileNumber', event.target.value)}
              placeholder="+225 07 00 00 00 00"
              required
              type="tel"
              value={values.mobileNumber}
            />
          </label>
        </div>

        <div className="split-fields">
          <label className="field">
            <span>Commune</span>
            <select
              disabled={!selectedCountry}
              onChange={(event) => updateField('commune', event.target.value)}
              value={values.commune}
            >
              <option value="">
                {selectedCountry ? 'Sélectionner une commune' : 'Choisir un pays'}
              </option>
              {values.commune && !hasCurrentCommuneOption ? (
                <option value={values.commune}>{values.commune}</option>
              ) : null}
              {selectedCountry?.communes.map((commune) => (
                <option key={commune.id} value={commune.name}>
                  {commune.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Pays</span>
            <select
              onChange={(event) => updateCountry(event.target.value)}
              value={values.country}
            >
              <option value="">Sélectionner un pays</option>
              {values.country && !hasCurrentCountryOption ? (
                <option value={values.country}>{values.country}</option>
              ) : null}
              {countries.map((country) => (
                <option key={country.id} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button className="primary-button" disabled={isSubmitting} type="submit">
          <Save size={18} />
          {isSubmitting ? 'Enregistrement...' : contact ? 'Mettre à jour' : 'Créer'}
        </button>
      </form>
    </aside>
  )
}
