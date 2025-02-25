import type { Weight } from './Components/Optimization/WeightOptions'

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
  cumulative: Array<number> 
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

export interface OptimizationApiData {
  request: string,
  name: string,
  iterations: number,
  particleRange: number[],
  maxProducts: number,
  value: number,
  option: string,
  density: number,
  volume: number,
  products: Products,
  weights: Weight
}

export interface ReportApiRequest {
  fitness: number,
  curve: Array<number>,
  pillVolume: number,
  pillDensity: number,
  bridgingMode: string,
  bridgingValue: number,
  iterations: number,
  totalMass: number,
  products: ProductsInCombination,
  weighting: Weight,
  email: string,
  user: string
}

export interface BridgeApiRequest {
  option: string,
  value: number
}