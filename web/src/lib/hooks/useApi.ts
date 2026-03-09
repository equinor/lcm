import axios from 'axios'
import type { BridgeApiRequest, OptimizationApiData, ProductValues, ReportApiRequest } from '../types'

export function useApi() {
  const BASE_PATH = '/api'

  function apiPost<T>(endpoint: string, data: T, responseType: 'blob' | 'json' = 'json') {
    return axios.post(`${BASE_PATH}/${endpoint}`, data, {
      responseType,
    })
  }

  function apiGet(endpoint: string) {
    return axios.get(`${BASE_PATH}/${endpoint}`)
  }

  function runOptimizer(data: OptimizationApiData) {
    return apiPost('optimizer', data)
  }

  function calculateBridgeFromCombination(data: ProductValues[]) {
    return apiPost('combination', data)
  }

  function createReport(data: ReportApiRequest) {
    return apiPost('report', data, 'blob')
  }

  function calculateOptimalBridge(data: BridgeApiRequest) {
    return apiPost('bridge', data)
  }

  function synchronizeSharepoint() {
    return apiPost('sync', {})
  }

  function getProducts() {
    return apiGet('products')
  }

  function getFractions() {
    return apiGet('fractions')
  }

  return {
    runOptimizer,
    calculateBridgeFromCombination,
    createReport,
    calculateOptimalBridge,
    synchronizeSharepoint,
    getProducts,
    getFractions,
  }
}
