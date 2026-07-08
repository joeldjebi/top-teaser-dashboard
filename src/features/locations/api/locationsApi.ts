import { apiRequest } from '../../../lib/apiClient'
import type { Commune, Country } from '../types/locationTypes'

type ApiData<T> = {
  data: T
}

export function fetchCountries(token: string) {
  return apiRequest<ApiData<Country[]>>('/api/locations/countries', { token })
}

export function createCountry(
  token: string,
  payload: { name: string; code?: string | null },
) {
  return apiRequest<ApiData<Country>>('/api/locations/countries', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
}

export function updateCountry(
  token: string,
  countryId: number,
  payload: { name?: string; code?: string | null },
) {
  return apiRequest<ApiData<Country>>(`/api/locations/countries/${countryId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  })
}

export function deleteCountry(token: string, countryId: number) {
  return apiRequest<null>(`/api/locations/countries/${countryId}`, {
    method: 'DELETE',
    token,
  })
}

export function createCommune(
  token: string,
  countryId: number,
  payload: { name: string },
) {
  return apiRequest<ApiData<Commune>>(
    `/api/locations/countries/${countryId}/communes`,
    {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    },
  )
}

export function updateCommune(
  token: string,
  communeId: number,
  payload: { name: string },
) {
  return apiRequest<ApiData<Commune>>(`/api/locations/communes/${communeId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  })
}

export function deleteCommune(token: string, communeId: number) {
  return apiRequest<null>(`/api/locations/communes/${communeId}`, {
    method: 'DELETE',
    token,
  })
}
