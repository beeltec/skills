#!/usr/bin/env python3

import os
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
README = (ROOT / "README.md").read_text(encoding="utf-8")
REMOVED_PUBLIC_NAMES = ("setup-wiki", "to-tasks", "to-wiki")


class CatalogContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.skill_files = sorted((ROOT / "skills").glob("*/*/SKILL.md"))
        cls.skill_names = []
        for skill_file in cls.skill_files:
            content = skill_file.read_text(encoding="utf-8")
            match = re.search(r"(?m)^name:\s*([a-z0-9-]+)\s*$", content)
            if match is None:
                raise AssertionError(f"missing frontmatter name: {skill_file}")
            cls.skill_names.append(match.group(1))

    def test_readme_count_and_rows_match_canonical_skills(self) -> None:
        count = re.search(r"A collection of (\d+) reusable skills", README)
        self.assertIsNotNone(count)
        self.assertEqual(int(count.group(1)), len(self.skill_files))

        rows = set(re.findall(r"(?m)^\| \*\*([a-z0-9-]+)\*\* \|", README))
        self.assertEqual(rows, set(self.skill_names))

    def test_directory_frontmatter_metadata_and_symlink_names_agree(self) -> None:
        for skill_file, name in zip(self.skill_files, self.skill_names):
            canonical_directory = skill_file.parent
            self.assertEqual(canonical_directory.name, name)

            link = ROOT / ".agents" / "skills" / name
            self.assertTrue(link.is_symlink(), f"missing skill symlink: {link}")
            expected_target = os.path.relpath(canonical_directory, link.parent)
            self.assertEqual(os.readlink(link), expected_target)

            metadata = canonical_directory / "agents" / "openai.yaml"
            if metadata.is_file():
                content = metadata.read_text(encoding="utf-8")
                display_name = re.search(r'(?m)^\s*display_name:\s*"([^"]+)"\s*$', content)
                self.assertIsNotNone(display_name, f"missing display_name: {metadata}")
                normalized = display_name.group(1).lower().replace(" ", "-")
                self.assertEqual(normalized, name)
                self.assertIn(f"${name}", content)

    def test_removed_skills_and_stale_public_workflow_are_absent(self) -> None:
        diagram = (ROOT / "docs/assets/development-workflow.svg").read_text(
            encoding="utf-8"
        )
        active_publication = README + diagram
        active_contracts = active_publication + "".join(
            path.read_text(encoding="utf-8")
            for pattern in ("*/*/SKILL.md", "*/*/agents/openai.yaml")
            for path in sorted((ROOT / "skills").glob(pattern))
        )
        for name in REMOVED_PUBLIC_NAMES:
            self.assertNotIn(name, self.skill_names)
            self.assertFalse(os.path.lexists(ROOT / ".agents" / "skills" / name))
            self.assertNotIn(name, active_contracts)

        for obsolete in ("validate-wiki.mjs", "wiki:check"):
            self.assertNotIn(obsolete, active_contracts)

        for obsolete in ("docs/tasks", "000-overview.md"):
            self.assertNotIn(obsolete, active_publication)


if __name__ == "__main__":
    unittest.main()
