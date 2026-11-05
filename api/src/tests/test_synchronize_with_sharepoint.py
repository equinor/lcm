import unittest
from types import SimpleNamespace
from unittest.mock import patch

from config import config
from use_cases import synchronize_with_sharepoint as sync
from util.exceptions import InternalErrorException


def product(key):
    return {"PartitionKey": config.PRODUCT_TABLE_NAME, "RowKey": key, "id": key}


def entity(key):
    return SimpleNamespace(PartitionKey=config.PRODUCT_TABLE_NAME, RowKey=key)


class SyncProductsTest(unittest.TestCase):
    def setUp(self):
        self.metadata = self._patch("get_metadata_blob_data", return_value=[product("retained"), product("new")])
        self._patch("get_product_blobs_data", return_value={"retained": {"cumulative": [0, 100]}})
        self.service = self._patch("TableService").return_value
        self.batch = self._patch("TableBatch").return_value
        self.service.exists.return_value = True
        self.service.query_entities.return_value = [entity("retained"), entity("removed")]

    def _patch(self, name, **kwargs):
        patcher = patch.object(sync, name, **kwargs)
        self.addCleanup(patcher.stop)
        return patcher.start()

    def test_replaces_and_removes_products_in_one_transaction(self):
        sync.sync_excel_blobs_and_az_tables()

        self.batch.insert_or_replace_entity.assert_any_call({**product("retained"), "cumulative": "[0, 100]"})
        self.batch.insert_or_replace_entity.assert_any_call({**product("new"), "cumulative": None})
        self.batch.delete_entity.assert_called_once_with(config.PRODUCT_TABLE_NAME, "removed")
        self.service.commit_batch.assert_called_once_with(table_name=config.PRODUCT_TABLE_NAME, batch=self.batch)

    def test_empty_metadata_does_not_write(self):
        self.metadata.return_value = []

        with self.assertRaises(InternalErrorException):
            sync.sync_excel_blobs_and_az_tables()
        self.service.commit_batch.assert_not_called()

    def test_duplicate_product_keys_do_not_write(self):
        self.metadata.return_value = [product("duplicate"), product("duplicate")]

        with self.assertRaises(InternalErrorException):
            sync.sync_excel_blobs_and_az_tables()
        self.service.commit_batch.assert_not_called()

    def test_exceeding_transaction_limit_does_not_write(self):
        self.metadata.return_value = [product(str(i)) for i in range(100)]
        self.service.query_entities.return_value = [entity("obsolete")]

        with self.assertRaises(InternalErrorException):
            sync.sync_excel_blobs_and_az_tables()
        self.service.commit_batch.assert_not_called()

    def test_creates_missing_table(self):
        self.service.exists.return_value = False

        sync.sync_excel_blobs_and_az_tables()

        self.service.create_table.assert_called_once_with(config.PRODUCT_TABLE_NAME)
        self.service.commit_batch.assert_called_once()
