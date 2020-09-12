# This module contains functions for
# retrieving data from the azure tables database.
from azure.cosmosdb.table import TableService
from config import Config


METADATA_TABLE_NAME = "Metadata"
CUMULATIVE_TABLE_NAME = "Cumulative"
DISTRIBUTION_TABLE_NAME = "Distribution"

table_service = TableService(account_name=Config.TABEL_ACCOUNT_NAME, account_key=Config.TABEL_KEY)


# This function returns a dictionary of metadata
# or all products in the database. The dict is
# structured as such: {ID: {METADATA_CATEGORY: VALUE}}
def getMetadata():
    products = table_service.query_entities(METADATA_TABLE_NAME)

    metadata_dict = {}
    
    for product in products:
        if product["RowKey"] != "Size_steps":
            product_dict = {}
            for category in product:
                """
                if (
                    (category != "Timestamp")
                    and (category != "PartitionKey")
                    and (category != "RowKey")
                    and (category != "etag")
                ):
                """
                product_dict[category] = product[category]

            metadata_dict[product.RowKey] = product_dict

    return metadata_dict


# This function returns a dictionary of all metadata
# for a single product based on the input id. The
# dictionary is structured as such: {METADATA_CATEGORY: VALUE}
def getMetadataFromID(id):
    product = table_service.get_entity(
        table_name=METADATA_TABLE_NAME, partition_key="Metadata", row_key=id
    )

    product_dict = {}

    for category in product:
        if (
            (category != "Timestamp")
            and (category != "PartitionKey")
            and (category != "RowKey")
            and (category != "etag")
        ):
            product_dict[category] = product[category]

    return product_dict


# This function gets the size steps of the distributions
# of the products, and returns them as a list.
def getSizeSteps():
    return [
        0.01, 0.0114, 0.0129, 0.0147, 0.0167, 0.0189, 0.0215, 0.0244, 0.0278, 0.0315, 0.0358, 0.0407, 0.0463, 0.0526,
        0.0597, 0.0679, 0.0771, 0.0876, 0.0995, 0.113, 0.128, 0.146, 0.166, 0.188, 0.214, 0.243, 0.276, 0.314, 0.357,
        0.405, 0.46, 0.523, 0.594, 0.675, 0.767, 0.872, 0.991, 1.13, 1.28, 1.45, 1.65, 1.88, 2.13, 2.42, 2.75, 3.12,
        3.55, 4.03, 4.58, 5.21, 5.92, 6.72, 7.64, 8.68, 9.86, 11.2, 12.7, 14.5, 16.4, 18.7, 21.2, 24.1, 27.4, 31.1,
        35.3, 40.1, 45.6, 51.8, 58.9, 66.9, 76, 86.4, 98.1, 111, 127, 144, 163, 186, 211, 240, 272, 310, 352, 400, 454,
        516, 586, 666, 756, 859, 976, 1110, 1260, 1430, 1630, 1850, 2100, 2390, 2710, 3080, 3500
    ]


# This function gets the cumulative distribution for a product,
# based on its id. the cumulative distribution is returned as a list.
def getCumulative(id):
    cumulatives = table_service.query_entities(CUMULATIVE_TABLE_NAME)

    cumulative = ""

    for value in cumulatives:
        if value["RowKey"] == id:
            cumulative = value["Value"]

    cumulative_list = cumulative.strip("[]").split(", ")

    for i in range(len(cumulative_list)):
        cumulative_list[i] = float(cumulative_list[i])

    return cumulative_list


# This function gets the particle size distribution (PSD)
# of a product based on its id, and returns it as a list.
def getDistribution(id):



    distributions = table_service.query_entities(DISTRIBUTION_TABLE_NAME)

    distribution = ""

    for value in distributions:
        if value["RowKey"] == id:
            distribution = value["Value"]

    distribution_list = distribution.strip("[]").split(", ")

    for i in range(len(distribution_list)):
        distribution_list[i] = float(distribution_list[i])

    return distribution_list


# This function returns a dictionary of all products in the
# database, as a dictionary mapping ids to the product names
def listProducts():



    products = table_service.query_entities(METADATA_TABLE_NAME)

    product_dict = {}

    for product in products:
        if product["RowKey"] != "Size_steps":
            product_dict[product["TITLE"]] = int(product["RowKey"])

    return product_dict
