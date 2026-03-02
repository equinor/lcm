import type { Weight } from '../Components/Optimization/WeightOptions'

export type Product = {
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

export type Products = {
  [id: string]: Product
}

export type ProductValues = {
  id: string
  value: number
  percentage: number
}

export type ProductsInCombination = {
  [id: string]: ProductValues
}

export type Combination = {
  name: string
  sacks: boolean
  values: ProductsInCombination
  cumulative: Array<number>
}

export type Combinations = {
  [name: string]: Combination
}

export type Bridge = {
  [name: string]: Array<number>
}

export type GraphData = {
  size: number
  [name: string]: number
}

export type Performance = {
  bridge: number
  mass: number
  products: number
}

export type Config = {
  iterations: number
  mode: string
  value: number
}

export type OptimizationData = {
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

export type OptimizationApiData = {
  request: string
  name: string
  iterations: number
  particleRange: number[]
  maxProducts: number
  value: number
  option: string
  density: number
  volume: number
  products: Products
  weights: Weight
}

export type ReportApiRequest = {
  fitness: number
  curve: Array<number>
  pillVolume: number
  pillDensity: number
  bridgingMode: string
  bridgingValue: number
  iterations: number
  totalMass: number
  products: ProductsInCombination
  weighting: Weight
  email: string
  user: string
}

export type BridgeApiRequest = {
  option: string
  value: number
}
