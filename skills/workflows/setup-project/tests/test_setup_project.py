#!/usr/bin/env python3

import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
INSTALLER = SKILL_ROOT / "scripts" / "setup_project.py"
FIXTURES = Path(__file__).resolve().parent / "fixtures"


class SetupProjectTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.project = Path(self.temporary_directory.name) / "fresh-project"
        self.project.mkdir()
        (self.project / "package.json").write_text(
            json.dumps(
                {
                    "name": "fresh-project",
                    "scripts": {"project:check": "existing-command"},
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
        self.lockfile = self.project / "package-lock.json"
        self.lockfile.write_bytes(b'{"lockfileVersion":3}\n')

    def tearDown(self) -> None:
        self.temporary_directory.cleanup()

    def run_installer(self) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["python3", str(INSTALLER), "--root", str(self.project)],
            check=True,
            capture_output=True,
            text=True,
        )

    def validate(self) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["node", "scripts/validate-project.mjs"],
            cwd=self.project,
            capture_output=True,
            text=True,
        )

    def snapshot(self) -> dict[str, bytes]:
        return {
            str(path.relative_to(self.project)): path.read_bytes()
            for path in sorted(self.project.rglob("*"))
            if path.is_file()
        }

    def install_fixture(self, source: str, target: str) -> None:
        destination = self.project / "docs" / "backlog" / target
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(FIXTURES / source, destination)

    def test_fresh_install_validates_and_second_run_is_byte_for_byte_noop(self) -> None:
        first = self.run_installer()

        self.assertTrue((self.project / "docs/wiki/index.md").is_file())
        self.assertTrue((self.project / "docs/backlog/maintenance.md").is_file())
        self.assertTrue((self.project / "scripts/validate-project.mjs").is_file())
        self.assertFalse((self.project / "docs/tasks").exists())
        self.assertEqual(self.lockfile.read_bytes(), b'{"lockfileVersion":3}\n')
        package = json.loads((self.project / "package.json").read_text(encoding="utf-8"))
        self.assertEqual(package["scripts"]["project:check"], "existing-command")
        self.assertEqual(
            package["scripts"]["project:validate"],
            "node scripts/validate-project.mjs",
        )
        self.assertIn("added project:validate", first.stdout)

        validation = self.validate()
        self.assertEqual(validation.returncode, 0, validation.stderr)
        self.assertIn("Wiki validation passed", validation.stdout)
        self.assertIn("Backlog validation passed", validation.stdout)

        before = self.snapshot()
        second = self.run_installer()
        self.assertEqual(self.snapshot(), before)
        self.assertNotIn("created", second.stdout)
        self.assertNotIn("updated", second.stdout)

    def test_valid_epic_and_work_fixture_pass(self) -> None:
        self.run_installer()
        self.install_fixture("valid/EPIC-001.md", "epics/EPIC-001-governed-delivery/EPIC-001.md")
        self.install_fixture("valid/WORK-001.md", "epics/EPIC-001-governed-delivery/WORK-001-first-change.md")
        (self.project / "docs/backlog/epics/index.md").write_text(
            "# Active Epics\n\n- [EPIC-001](EPIC-001-governed-delivery/) - Governed delivery.\n",
            encoding="utf-8",
        )
        index = self.project / "docs/backlog/index.md"
        index.write_text(
            index.read_text(encoding="utf-8").replace(
                "No executable work is ranked. Add every active `WORK-NNN` exactly once as an ordered Markdown link; position 1 is the next work item.",
                "1. [WORK-001](epics/EPIC-001-governed-delivery/WORK-001-first-change.md)",
            ),
            encoding="utf-8",
        )

        validation = self.validate()
        self.assertEqual(validation.returncode, 0, validation.stderr)
        self.assertIn("Backlog validation passed: 2 records checked", validation.stdout)

    def test_invalid_ready_record_reports_actionable_readiness_errors(self) -> None:
        self.run_installer()
        self.install_fixture("invalid/WORK-010-not-ready.md", "standalone/WORK-010-not-ready.md")
        (self.project / "docs/backlog/standalone/index.md").write_text(
            "# Active standalone work\n\n- [WORK-010](WORK-010-not-ready.md) - Invalid readiness fixture.\n",
            encoding="utf-8",
        )
        index = self.project / "docs/backlog/index.md"
        index.write_text(
            index.read_text(encoding="utf-8").replace(
                "No executable work is ranked. Add every active `WORK-NNN` exactly once as an ordered Markdown link; position 1 is the next work item.",
                "1. [WORK-010](standalone/WORK-010-not-ready.md)",
            ),
            encoding="utf-8",
        )

        validation = self.validate()
        self.assertNotEqual(validation.returncode, 0)
        self.assertIn("ready work requires checkable acceptance criteria", validation.stderr)
        self.assertIn("ready work requires wiki_refs or [none]", validation.stderr)
        self.assertIn("Execution must record approach, verification, and explicit approval", validation.stderr)

    def test_blocking_cycle_and_broken_wiki_link_fail_actionably(self) -> None:
        self.run_installer()
        self.install_fixture("invalid/WORK-020-cycle.md", "standalone/WORK-020-cycle.md")
        self.install_fixture("invalid/WORK-021-cycle.md", "standalone/WORK-021-cycle.md")
        (self.project / "docs/backlog/standalone/index.md").write_text(
            "# Active standalone work\n\n"
            "- [WORK-020](WORK-020-cycle.md) - First blocker.\n"
            "- [WORK-021](WORK-021-cycle.md) - Second blocker.\n",
            encoding="utf-8",
        )
        index = self.project / "docs/backlog/index.md"
        index.write_text(
            index.read_text(encoding="utf-8").replace(
                "No executable work is ranked. Add every active `WORK-NNN` exactly once as an ordered Markdown link; position 1 is the next work item.",
                "1. [WORK-020](standalone/WORK-020-cycle.md)\n"
                "2. [WORK-021](standalone/WORK-021-cycle.md)",
            ),
            encoding="utf-8",
        )
        wiki_page = self.project / "docs/wiki/start-here.md"
        wiki_page.write_text(
            wiki_page.read_text(encoding="utf-8") + "\n[Missing](missing-page.md)\n",
            encoding="utf-8",
        )

        validation = self.validate()
        self.assertNotEqual(validation.returncode, 0)
        self.assertIn("broken link missing-page.md", validation.stderr)
        self.assertIn("blocking cycle: WORK-020 -> WORK-021 -> WORK-020", validation.stderr)


if __name__ == "__main__":
    unittest.main()
