import unittest
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.core.security import generate_otp, hash_otp, verify_otp_hash

class TestAuthOTP(unittest.TestCase):
    def test_otp_generation(self):
        """Verify OTP is exactly 6 numerical digits."""
        otp = generate_otp(6)
        self.assertEqual(len(otp), 6)
        self.assertTrue(otp.isdigit())

    def test_otp_hashing_and_verification(self):
        """Verify salted SHA-256 OTP hashing and constant-time verification."""
        plain_otp = "482910"
        hashed, salt = hash_otp(plain_otp)

        self.assertNotEqual(plain_otp, hashed)
        self.assertTrue(verify_otp_hash(plain_otp, hashed, salt))
        self.assertFalse(verify_otp_hash("000000", hashed, salt))

    def test_different_salts_produce_different_hashes(self):
        """Ensure identical OTPs produce unique hashes with distinct cryptographic salts."""
        otp = "123456"
        hash1, salt1 = hash_otp(otp)
        hash2, salt2 = hash_otp(otp)

        self.assertNotEqual(salt1, salt2)
        self.assertNotEqual(hash1, hash2)
        self.assertTrue(verify_otp_hash(otp, hash1, salt1))
        self.assertTrue(verify_otp_hash(otp, hash2, salt2))

if __name__ == "__main__":
    unittest.main()

