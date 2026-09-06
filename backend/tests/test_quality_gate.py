import unittest

from fastapi import HTTPException

from backend.security_hardening import clean_text, validate_case_input
from backend.services.debate_service import get_opposite_position
from backend.services.legal_rag_service import retrieve_legal_context


class QualityGateTests(unittest.TestCase):
    def test_short_facts_are_rejected(self):
        with self.assertRaises(HTTPException) as ctx:
            validate_case_input(facts="too short")
        self.assertEqual(ctx.exception.status_code, 422)

    def test_control_characters_are_removed(self):
        self.assertEqual(clean_text("offer\x00 acceptance"), "offer acceptance")

    def test_long_input_is_rejected(self):
        with self.assertRaises(HTTPException):
            clean_text("x" * 4001)

    def test_existing_position_logic_is_preserved(self):
        self.assertEqual(get_opposite_position("FOR"), "AGAINST")
        self.assertEqual(get_opposite_position("AGAINST"), "FOR")

    def test_rag_returns_provenance(self):
        results = retrieve_legal_context("offer acceptance contract", jurisdiction="India (Common Law)", subject="Contract Law")
        self.assertTrue(results)
        self.assertIn("source", results[0])
        self.assertIn("verification", results[0])
        self.assertIn("relevanceScore", results[0])


if __name__ == "__main__":
    unittest.main()
