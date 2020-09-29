import axios from 'axios'
import { ProductsApi } from './gen-api/src/apis'
import { Configuration } from './gen-api/src'

const BASE_PATH = '/api'
const APIConfiguration = new Configuration({ basePath: BASE_PATH })

class LogicAppApi {
  async getInvokeRefresh() {
    alert('Not implemented')
    // return axios.get('https://prod-10.northeurope.logic.azure.com:443/workflows/cbc8e9fd48df4f8db2c1a32149e29af0/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=qnD24LqvPoCms52pK_E4G-wslzVElxjUiaE8Cb9qPjI')
  }
}

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

export const ProductsAPI = new ProductsApi(APIConfiguration)
export const LogicAppAPI = new LogicAppApi()
export const OptimizerAPI = new OptimizerApi()
