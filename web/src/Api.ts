import axios from 'axios'
import { ProductsApi } from './gen-api/src/apis'
import { Configuration } from './gen-api/src'

const BASE_PATH = '/api'
const APIConfiguration = new Configuration({ basePath: BASE_PATH, accessToken: '' })

export enum Requests {
  SIZE_FRACTIONS = 'SIZE_FRACTIONS',
  BRIDGE = 'BRIDGE',
  MIX_PRODUCTS = 'MIX_PRODUCTS',
}

class OptimizerApi {
  async postOptimizerApi(token: string, data: any) {
    return axios.post(BASE_PATH, data, { headers: { Authorization: `Bearer ${token}` } })
  }
}

class SyncApi {
  async postSyncApi(token: string) {
    return axios.post(`${BASE_PATH}/sync`, {}, { headers: { Authorization: `Bearer ${token}` } })
  }
}

export const ProductsAPI = new ProductsApi(APIConfiguration)
export const OptimizerAPI = new OptimizerApi()
export const SyncAPI = new SyncApi()
