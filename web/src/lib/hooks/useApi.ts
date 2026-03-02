import axios from 'axios'
import { useAuthContext } from 'react-oauth2-code-pkce'
import type { BridgeApiRequest, OptimizationApiData, ProductValues, ReportApiRequest } from '../../Types'

export function useApi() {
  const BASE_PATH = '/api'
  const { token } = useAuthContext()

  function apiPost<T>(endpoint: string, data: T, extraHeaders?: Record<string, string>) {
    return axios.post(`${BASE_PATH}/${endpoint}`, data, {
      headers: { Authorization: `Bearer ${token}`, ...extraHeaders },
    })
  }

  function apiGet(endpoint: string, extraHeaders?: Record<string, string>) {
    return axios.get(`${BASE_PATH}/${endpoint}`, {
      headers: { Authorization: `Bearer ${token}`, ...extraHeaders },
    })
  }

  function postOptimizer(data: OptimizationApiData) {
    return apiPost('optimizer', data)
  }

  function postCombination(data: ProductValues[]) {
    return apiPost('combination', data)
  }

  function postReport(data: ReportApiRequest) {
    return apiPost('report', data, { responseType: 'blob' })
  }

  function postBridge(data: BridgeApiRequest) {
    return apiPost('bridge', data)
  }

  function postSync() {
    return apiPost('sync', {})
  }

  function getProducts() {
    return apiGet('products')
  }

  function getFractions() {
    return apiGet('fractions')
  }

  return {
    postOptimizer,
    postCombination,
    postReport,
    postBridge,
    postSync,
    getProducts,
    getFractions,
  }
}
