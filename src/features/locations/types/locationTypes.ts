export type Commune = {
  id: number
  countryId: number
  name: string
  createdAt: string
  updatedAt: string
}

export type Country = {
  id: number
  name: string
  code: string | null
  communes: Commune[]
  createdAt: string
  updatedAt: string
}
