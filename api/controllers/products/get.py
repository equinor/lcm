from util import DatabaseOperations as db


def products_get():
    metadata = db.getMetadata()

    return_list = []
    for product_id in metadata:
        data_dict = {
            "id": product_id,
            "name": metadata[product_id]["title"],
            "supplier": metadata[product_id]["supplier"],
            "sack_size": float(metadata[product_id]["sack_size"]),
        }
        return_list.append(data_dict)

    return return_list
