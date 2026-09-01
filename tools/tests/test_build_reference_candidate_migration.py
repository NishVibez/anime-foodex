from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).parents[1] / "build_reference_candidate_migration.py"
SPEC = importlib.util.spec_from_file_location("candidate_migration", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class PostgresJsonbLiteralTests(unittest.TestCase):
    def test_uses_preferred_tag_when_payload_does_not_contain_it(self) -> None:
        literal = MODULE.postgres_jsonb_literal(
            [{"title": "Safe title"}], "reference_sources"
        )

        self.assertTrue(literal.startswith("$reference_sources$"))
        self.assertTrue(literal.endswith("$reference_sources$::jsonb"))

    def test_selects_a_collision_free_tag_for_untrusted_text(self) -> None:
        literal = MODULE.postgres_jsonb_literal(
            [
                {
                    "title": (
                        "$reference_sources$ || dangerous_sql() || "
                        "$reference_sources$"
                    )
                }
            ],
            "reference_sources",
        )

        self.assertTrue(literal.startswith("$reference_sources_1$"))
        self.assertTrue(literal.endswith("$reference_sources_1$::jsonb"))
        self.assertIn("$reference_sources$", literal)

    def test_skips_multiple_colliding_tags(self) -> None:
        literal = MODULE.postgres_jsonb_literal(
            [{"title": "$candidate_ids$ and $candidate_ids_1$"}],
            "candidate_ids",
        )

        self.assertTrue(literal.startswith("$candidate_ids_2$"))
        self.assertTrue(literal.endswith("$candidate_ids_2$::jsonb"))


if __name__ == "__main__":
    unittest.main()
