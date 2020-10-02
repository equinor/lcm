import axios from 'axios'
import { ProductsApi } from './gen-api/src/apis'
import { Configuration } from './gen-api/src'

const BASE_PATH = '/api'
const APIConfiguration = new Configuration({ basePath: BASE_PATH })

export enum Requests {
  SIZE_FRACTIONS = 'SIZE_FRACTIONS',
  BRIDGE = 'BRIDGE',
  MIX_PRODUCTS = 'MIX_PRODUCTS',
}

class OptimizerApi {
  async postOptimizerApi(data: any) {
    return axios.post(BASE_PATH, data)
  }
}

class SyncApi {
  async postSyncApi() {
    return axios.post(`${BASE_PATH}/sync`)
  }
}

export const ProductsAPI = new ProductsApi(APIConfiguration)
export const OptimizerAPI = new OptimizerApi()
export const SyncAPI = new SyncApi()
