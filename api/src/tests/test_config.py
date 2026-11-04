import unittest
from unittest import mock

from config import Config


class ConfigTest(unittest.TestCase):
    def test_defaults(self):
        with mock.patch.dict("os.environ", {}, clear=True):
            config = Config()
        self.assertEqual(config.GIT_TAG, "local version")
        self.assertEqual(config.GIT_COMMIT_HASH, "local development")
        self.assertEqual(config.TABLE_ACCOUNT_NAME, "lcmdevstorage")
        self.assertIsNone(config.TABLE_KEY)

    def test_audiences_from_comma_separated_env(self):
        with mock.patch.dict("os.environ", {"AUTH_JWT_AUDIENCES": "api://a, b"}, clear=True):
            config = Config()
        self.assertEqual(config.AUTH_JWT_AUDIENCES, ["api://a", "b"])

    def test_empty_env_falls_back_to_default(self):
        with mock.patch.dict("os.environ", {"GIT_TAG": "", "GIT_COMMIT_HASH": "abc123"}, clear=True):
            config = Config()
        self.assertEqual(config.GIT_TAG, "local version")
        self.assertEqual(config.GIT_COMMIT_HASH, "abc123")

    def test_constants_are_not_settings(self):
        with mock.patch.dict("os.environ", {"PRODUCT_TABLE_NAME": "other"}, clear=True):
            config = Config()
        self.assertEqual(config.PRODUCT_TABLE_NAME, "products")
