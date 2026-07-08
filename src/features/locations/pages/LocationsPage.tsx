import { Check, MapPin, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { ApiError } from '../../../lib/apiClient'
import { useConfirmDialog } from '../../../shared/confirm/ConfirmDialogProvider'
import { useAuth } from '../../auth/AuthProvider'
import {
  createCommune,
  createCountry,
  deleteCommune,
  deleteCountry,
  fetchCountries,
  updateCommune,
  updateCountry,
} from '../api/locationsApi'
import type { Country } from '../types/locationTypes'

export function LocationsPage() {
  const { token, user } = useAuth()
  const { confirm } = useConfirmDialog()
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null)
  const [countryForm, setCountryForm] = useState({ name: '', code: '' })
  const [communeName, setCommuneName] = useState('')
  const [editingCountryId, setEditingCountryId] = useState<number | null>(null)
  const [countryEdit, setCountryEdit] = useState({ name: '', code: '' })
  const [editingCommuneId, setEditingCommuneId] = useState<number | null>(null)
  const [communeEditName, setCommuneEditName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const canCreate = Boolean(user?.permissions.contacts.create)
  const canUpdate = Boolean(user?.permissions.contacts.update)
  const canDelete = Boolean(user?.permissions.contacts.delete)
  const selectedCountry = useMemo(
    () =>
      countries.find((country) => country.id === selectedCountryId) ??
      countries[0] ??
      null,
    [countries, selectedCountryId],
  )

  const loadCountries = useCallback(async () => {
    if (!token) return
    setError(null)
    setIsLoading(true)

    try {
      const { data } = await fetchCountries(token)
      setCountries(data)
      setSelectedCountryId((current) => current ?? data[0]?.id ?? null)
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : 'Impossible de charger les pays et communes.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadCountries()
  }, [loadCountries])

  async function handleCreateCountry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { data } = await createCountry(token, {
        name: countryForm.name,
        code: countryForm.code || null,
      })
      setCountries((current) => [...current, data].sort(sortCountries))
      setSelectedCountryId(data.id)
      setCountryForm({ name: '', code: '' })
      setSuccess('Pays créé.')
    } catch (countryError) {
      setError(
        countryError instanceof ApiError
          ? countryError.message
          : 'Impossible de créer le pays.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCreateCommune(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token || !selectedCountry) return
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await createCommune(token, selectedCountry.id, { name: communeName })
      setCommuneName('')
      setSuccess('Commune créée.')
      await loadCountries()
    } catch (communeError) {
      setError(
        communeError instanceof ApiError
          ? communeError.message
          : 'Impossible de créer la commune.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteCountry(country: Country) {
    if (!token) return
    const shouldDelete = await confirm({
      title: 'Supprimer ce pays ?',
      description: `Le pays « ${country.name} » et ses communes seront supprimés.`,
      confirmLabel: 'Supprimer',
      variant: 'danger',
    })
    if (!shouldDelete) return
    await deleteCountry(token, country.id)
    await loadCountries()
  }

  async function handleUpdateCountry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token || !editingCountryId) return
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await updateCountry(token, editingCountryId, {
        name: countryEdit.name,
        code: countryEdit.code || null,
      })
      setEditingCountryId(null)
      setCountryEdit({ name: '', code: '' })
      setSuccess('Pays modifié.')
      await loadCountries()
    } catch (countryError) {
      setError(
        countryError instanceof ApiError
          ? countryError.message
          : 'Impossible de modifier le pays.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateCommune(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token || !editingCommuneId) return
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await updateCommune(token, editingCommuneId, { name: communeEditName })
      setEditingCommuneId(null)
      setCommuneEditName('')
      setSuccess('Commune modifiée.')
      await loadCountries()
    } catch (communeError) {
      setError(
        communeError instanceof ApiError
          ? communeError.message
          : 'Impossible de modifier la commune.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteCommune(communeId: number) {
    if (!token) return
    const shouldDelete = await confirm({
      title: 'Supprimer cette commune ?',
      description: 'Elle ne sera plus proposée dans le formulaire contact.',
      confirmLabel: 'Supprimer',
      variant: 'danger',
    })
    if (!shouldDelete) return
    await deleteCommune(token, communeId)
    await loadCountries()
  }

  return (
    <div className="locations-page">
      <section className="page-hero compact-hero">
        <div>
          <p className="eyebrow">Référentiels</p>
          <h1>Pays & communes.</h1>
          <p className="muted">
            Gérez les valeurs utilisées dans le formulaire de création des
            contacts.
          </p>
        </div>
        <button className="secondary-button" onClick={loadCountries} type="button">
          <RefreshCw size={18} />
          Actualiser
        </button>
      </section>

      {error ? <div className="form-alert">{error}</div> : null}
      {success ? <div className="success-alert">{success}</div> : null}

      <section className="locations-grid">
        <form className="admin-panel stack-form" onSubmit={handleCreateCountry}>
          <div>
            <p className="eyebrow">Pays</p>
            <h2>Nouveau pays</h2>
          </div>
          <label className="field">
            <span>Nom du pays *</span>
            <input
              disabled={!canCreate}
              onChange={(event) =>
                setCountryForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Côte d’Ivoire"
              required
              value={countryForm.name}
            />
          </label>
          <label className="field">
            <span>Code</span>
            <input
              disabled={!canCreate}
              onChange={(event) =>
                setCountryForm((current) => ({
                  ...current,
                  code: event.target.value.toUpperCase(),
                }))
              }
              placeholder="CI"
              value={countryForm.code}
            />
          </label>
          <button className="primary-button" disabled={!canCreate || isSaving}>
            <Plus size={18} />
            Créer le pays
          </button>
        </form>

        <section className="admin-panel">
          <div>
            <p className="eyebrow">Pays enregistrés</p>
            <h2>{countries.length} pays</h2>
          </div>
          {isLoading ? (
            <div className="loading-state">Chargement...</div>
          ) : (
            <div className="country-list">
              {countries.map((country) => (
                <div className="country-row-wrap" key={country.id}>
                  {editingCountryId === country.id ? (
                    <form className="country-edit-form" onSubmit={handleUpdateCountry}>
                      <input
                        onChange={(event) =>
                          setCountryEdit((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        required
                        value={countryEdit.name}
                      />
                      <input
                        onChange={(event) =>
                          setCountryEdit((current) => ({
                            ...current,
                            code: event.target.value.toUpperCase(),
                          }))
                        }
                        placeholder="Code"
                        value={countryEdit.code}
                      />
                      <button className="icon-button soft" disabled={isSaving} type="submit">
                        <Check size={16} />
                      </button>
                      <button
                        className="icon-button soft"
                        onClick={() => setEditingCountryId(null)}
                        type="button"
                      >
                        <X size={16} />
                      </button>
                    </form>
                  ) : (
                    <button
                      className={
                        selectedCountry?.id === country.id
                          ? 'country-row active'
                          : 'country-row'
                      }
                      onClick={() => setSelectedCountryId(country.id)}
                      type="button"
                    >
                      <MapPin size={18} />
                      <span>
                        <strong>{country.name}</strong>
                        <small>
                          {country.code ?? 'Sans code'} · {country.communes.length}{' '}
                          commune(s)
                        </small>
                      </span>
                      <span className="row-actions">
                        <Pencil
                          aria-hidden="true"
                          className={canUpdate ? '' : 'disabled-icon'}
                          onClick={(event) => {
                            event.stopPropagation()
                            if (!canUpdate) return
                            setEditingCountryId(country.id)
                            setCountryEdit({
                              name: country.name,
                              code: country.code ?? '',
                            })
                          }}
                          size={17}
                        />
                        <Trash2
                          aria-hidden="true"
                          className={canDelete ? '' : 'disabled-icon'}
                          onClick={(event) => {
                            event.stopPropagation()
                            if (canDelete) void handleDeleteCountry(country)
                          }}
                          size={17}
                        />
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="admin-panel locations-commune-panel">
          <div>
            <p className="eyebrow">Communes</p>
            <h2>{selectedCountry?.name ?? 'Sélectionnez un pays'}</h2>
          </div>

          <form className="inline-form" onSubmit={handleCreateCommune}>
            <input
              disabled={!canCreate || !selectedCountry}
              onChange={(event) => setCommuneName(event.target.value)}
              placeholder="Cocody"
              required
              value={communeName}
            />
            <button
              className="primary-button"
              disabled={!canCreate || !selectedCountry || isSaving}
            >
              <Plus size={18} />
              Ajouter
            </button>
          </form>

          <div className="commune-list">
            {selectedCountry?.communes.map((commune) => (
              <div className="commune-row" key={commune.id}>
                {editingCommuneId === commune.id ? (
                  <form className="commune-edit-form" onSubmit={handleUpdateCommune}>
                    <input
                      onChange={(event) => setCommuneEditName(event.target.value)}
                      required
                      value={communeEditName}
                    />
                    <button className="icon-button soft" disabled={isSaving} type="submit">
                      <Check size={16} />
                    </button>
                    <button
                      className="icon-button soft"
                      onClick={() => setEditingCommuneId(null)}
                      type="button"
                    >
                      <X size={16} />
                    </button>
                  </form>
                ) : (
                  <>
                    <span>{commune.name}</span>
                    <div className="row-actions">
                      <button
                        className="icon-button soft"
                        disabled={!canUpdate}
                        onClick={() => {
                          setEditingCommuneId(commune.id)
                          setCommuneEditName(commune.name)
                        }}
                        type="button"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-button danger"
                        disabled={!canDelete}
                        onClick={() => handleDeleteCommune(commune.id)}
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {selectedCountry && selectedCountry.communes.length === 0 ? (
              <div className="empty-state">Aucune commune enregistrée.</div>
            ) : null}
          </div>
        </section>
      </section>
    </div>
  )
}

function sortCountries(first: Country, second: Country) {
  return first.name.localeCompare(second.name, 'fr')
}
