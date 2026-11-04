import os
import unittest

# Skip Azure Monitor setup, which requires a connection string
os.environ.setdefault("FLASK_DEBUG", "true")

from app import app


class PublicEndpointsTest(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_health_does_not_require_auth(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {"status": "ok"})

    def test_about_does_not_require_auth(self):
        response = self.client.get("/api/about")
        self.assertEqual(response.status_code, 200)
        self.assertIn("latestCommitHash", response.json)

    def test_other_endpoints_require_auth(self):
        response = self.client.get("/api/fractions")
        self.assertEqual(response.status_code, 401)
