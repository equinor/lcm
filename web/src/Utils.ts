import { Product } from './Types'

export function sortProducts(products: Array<Product>): Array<Product> {
  return products.sort((a, b) => {
    if (a.supplier > b.supplier) {
      return 1
    } else if (a.supplier === b.supplier) {
      if (a.id > b.id) {
        return 1
      } else return -1
    } else return -1
  })
}
