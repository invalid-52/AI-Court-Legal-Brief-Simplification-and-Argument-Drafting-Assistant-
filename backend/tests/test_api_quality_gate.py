import unittest

from fastapi.testclient import TestClient

from backend.enhanced_main import app


class EnhancedApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_route_still_exists(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)

    def test_source_aware_retrieval(self):
        response = self.client.post(
            "/api/learning/retrieve",
            json={"query": "contract offer acceptance", "jurisdiction": "India (Common Law)", "subject": "Contract Law"},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload["success"])
        self.assertTrue(payload["matches"])
        self.assertIn("source", payload["matches"][0])

    def test_oversized_payload_is_rejected_by_validation(self):
        response = self.client.post(
            "/api/learning/retrieve",
            json={"query": "x" * 4001},
        )
        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()

class ValidationMiddlewareTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_short_existing_irac_payload_is_rejected_before_ai(self):
        response = self.client.post("/api/debate/irac", json={"facts": "short"})
        self.assertEqual(response.status_code, 422)

    def test_security_headers_are_present(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.headers.get("x-content-type-options"), "nosniff")
        self.assertEqual(response.headers.get("x-frame-options"), "DENY")

    def test_valid_existing_debate_payload_reaches_original_route(self):
        response = self.client.post(
            "/api/debate/start",
            json={"case_facts": "A student agreed to purchase a textbook for a stated price and later disputed the agreement.", "user_position": "FOR"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["ai_position"], "AGAINST")
