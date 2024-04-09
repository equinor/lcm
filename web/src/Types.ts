import { Weight } from './Components/Optimization/WeightOptions'

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

export type TNewProduct = {
  productName: string
  productSupplier: string
  productData: number[][]
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

export interface GraphData {
  size: number
  [name: string]: number
}

export interface Performance {
  bridge: number
  mass: number
  products: number
}

export interface Config {
  iterations: number
  mode: string
  value: number
}

export interface OptimizationData {
  bridgeScore: number
  chosenMass: number
  chosenVolume: number
  config: Config
  cumulative: Array<number>
  curve: Array<number>
  executionTime: number
  fitness: number
  maxNumberOfProducts: number
  name: string
  performance: Performance
  products: ProductsInCombination
  productsChosen: Products
  totalMass: number
  weighting: Weight
}
