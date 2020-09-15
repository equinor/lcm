from flask import jsonify
from util import DatabaseOperations as db

SPELLING_ERROR = "ENVIROMENTAL_IMPACT"  # Spelling error in SharePoint


def products_get():
    metadata = db.getMetadata()

    filters = []
    try:
        if filters:
            for filter in filters:
                filtered_key_list = []

                field = filter["metadata"]
                if field == SPELLING_ERROR:
                    include = filter["include"]
                    for id in metadata:
                        if metadata[id][SPELLING_ERROR].upper() not in include:
                            filtered_key_list.append(id)
                else:
                    try:
                        min_val = filter["min"]
                    except KeyError:
                        min_val = 0

                    try:
                        max_val = filter["max"]
                    except KeyError:
                        max_val = float('inf')

                    for id in metadata:
                        if (
                                float(metadata[id][field]) < min_val
                                or float(metadata[id][field]) > max_val
                        ):
                            filtered_key_list.append(id)

                for id in filtered_key_list:
                    del metadata[id]
    except Exception as e:
        return jsonify(e), 400

    return_list = []
    for product_id in metadata:
        data_dict = {
            "id": product_id,
            "name": metadata[product_id]["title"],
            "supplier": metadata[product_id]["supplier"],
            "sack_size": float(metadata[product_id]["sack_size"])
        }
        return_list.append(data_dict)

    return jsonify(return_list), 200
