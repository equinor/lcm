export interface Product {
  id: string
  title: string
  supplier: string
  description: string
  shortname: string
  cost: number
  sackSize: number
  co2: number
  environmental: string
  cumulative: Array<number> | null
}

export interface Products {
  [id: string]: Product
}
