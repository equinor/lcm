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

export interface ProductValues {
  id: string
  value: number
  percentage: number
}

export interface ProductsInCombination {
  [id: string]: ProductValues
}

export interface Combination {
  name: string
  sacks: boolean
  values: ProductsInCombination
  cumulative: any
}

export interface Combinations {
  [name: string]: Combination
}

export interface Bridge {
  [name: string]: Array<number>
}
