# This module contains functions for
# retrieving data from the azure tables database.

from . import Authentication

METADATA_TABLE_NAME = "Metadata"
CUMULATIVE_TABLE_NAME = "Cumulative"
DISTRIBUTION_TABLE_NAME = "Distribution"


# This function returns a dictionary of metadata
# or all products in the database. The dict is
# structured as such: {ID: {METADATA_CATEGORY: VALUE}}
def getMetadata():
    secret = Authentication.getStorageSecret()

    table_service = Authentication.connectToTables(secret)

    products = table_service.query_entities(METADATA_TABLE_NAME)

    metadata_dict = {}

    for product in products:
        if product["RowKey"] != "Size_steps":
            product_dict = {}
            for category in product:
                if (
                    (category != "Timestamp")
                    and (category != "PartitionKey")
                    and (category != "RowKey")
                    and (category != "etag")
                ):
                    product_dict[category] = product[category]

            metadata_dict[product.RowKey] = product_dict

    return metadata_dict


# This function returns a dictionary of all metadata
# for a single product based on the input id. The
# dictionary is structured as such: {METADATA_CATEGORY: VALUE}
def getMetadataFromID(id):
    secret = Authentication.getStorageSecret()

    table_service = Authentication.connectToTables(secret)

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
    secret = Authentication.getStorageSecret()

    table_service = Authentication.connectToTables(secret)

    size_steps_str = table_service.get_entity(
        table_name=METADATA_TABLE_NAME, partition_key="Metadata", row_key="Size_steps"
    ).Size_steps

    size_steps = size_steps_str.strip("[]").split(", ")

    for i in range(len(size_steps)):
        size_steps[i] = float(size_steps[i])

    return size_steps


# This function gets the cumulative distribution for a product,
# based on its id. the cumulative distribution is returned as a list.
def getCumulative(id):
    secret = Authentication.getStorageSecret()

    table_service = Authentication.connectToTables(secret)

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
    secret = Authentication.getStorageSecret()

    table_service = Authentication.connectToTables(secret)

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
    secret = Authentication.getStorageSecret()

    table_service = Authentication.connectToTables(secret)

    products = table_service.query_entities(METADATA_TABLE_NAME)

    product_dict = {}

    for product in products:
        if product["RowKey"] != "Size_steps":
            product_dict[product["TITLE"]] = int(product["RowKey"])

    return product_dict
