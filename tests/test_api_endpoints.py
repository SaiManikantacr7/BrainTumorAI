import unittest
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from fastapi.testclient import TestClient
from main import app

class TestAPIEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_check(self):
        """Verify API health endpoint returns online status and clinical disclaimer."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "online")
        self.assertIn("Research Prototype", data["disclaimer"])

    def test_auth_otp_flow(self):
        """Verify OTP request endpoint."""
        response = self.client.post("/api/auth/otp/send", json={"email": "test.clinician@neuroscan.ai", "purpose": "LOGIN"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["email"], "test.clinician@neuroscan.ai")

    def test_models_endpoint(self):
        """Verify model zoo benchmarks are returned."""
        response = self.client.get("/api/models")
        self.assertEqual(response.status_code, 200)
        models = response.json()
        self.assertTrue(len(models) >= 4)
        self.assertEqual(models[0]["id"], "neuroscan-effnet-att")

    def test_patients_endpoint(self):
        """Verify patient list returns valid records."""
        response = self.client.get("/api/patients")
        self.assertEqual(response.status_code, 200)
        patients = response.json()
        self.assertTrue(len(patients) >= 1)

    def test_timeline_endpoint(self):
        """Verify longitudinal timeline returns sequential points with model-observed change."""
        response = self.client.get("/api/patients/P-1001/timeline")
        self.assertEqual(response.status_code, 200)
        timeline = response.json()
        self.assertEqual(len(timeline), 4)
        self.assertIn("Baseline", timeline[0]["model_observed_change"])

if __name__ == "__main__":
    unittest.main()

