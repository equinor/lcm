import axios from 'axios'

const BASE_PATH = '/api'

export enum Requests {
  SIZE_FRACTIONS = 'SIZE_FRACTIONS',
}

class OptimizerApi {
  async postOptimizerApi(token: string, data: any) {
    return axios.post(BASE_PATH, data, { headers: { Authorization: `Bearer ${token}` } })
  }
}

class CombinationApi {
  async postCombinationApi(token: string, data: any) {
    return axios.post(`${BASE_PATH}/combination`, data, { headers: { Authorization: `Bearer ${token}` } })
  }
}

class ReportApi {
  async postReportApi(token: string, data: any) {
    return axios.post(`${BASE_PATH}/report`, data, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    })
  }
}

class BridgeApi {
  async postBridgeApi(token: string, data: any) {
    return axios.post(`${BASE_PATH}/bridge`, data, { headers: { Authorization: `Bearer ${token}` } })
  }
}

class SyncApi {
  async postSyncApi(token: string) {
    return axios.post(`${BASE_PATH}/sync`, {}, { headers: { Authorization: `Bearer ${token}` } })
  }
}

class ProductsApi {
  async getProductsApi(token: string) {
    return axios.get(`${BASE_PATH}/products`, { headers: { Authorization: `Bearer ${token}` } })
  }
}

export const ProductsAPI = new ProductsApi()
export const OptimizerAPI = new OptimizerApi()
export const BridgeAPI = new BridgeApi()
export const CombinationAPI = new CombinationApi()
export const ReportAPI = new ReportApi()
export const SyncAPI = new SyncApi()
