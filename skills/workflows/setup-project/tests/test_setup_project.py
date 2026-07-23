#!/usr/bin/env python3

import argparse
import base64
import contextlib
import gzip
import hashlib
import importlib.util
import io
import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest import mock


SKILL_ROOT = Path(__file__).resolve().parents[1]
INSTALLER = SKILL_ROOT / "scripts" / "setup_project.py"
FIXTURES = Path(__file__).resolve().parent / "fixtures"
SPEC = importlib.util.spec_from_file_location("setup_project_installer", INSTALLER)
assert SPEC and SPEC.loader
SETUP_PROJECT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SETUP_PROJECT)
LEGACY_INSTRUCTIONS = """<!-- setup-wiki:start -->
## Project knowledge

- Run `node scripts/validate-wiki.mjs` after wiki changes.
<!-- setup-wiki:end -->"""
LEGACY_VALIDATOR = gzip.decompress(
    base64.b64decode((FIXTURES / "legacy" / "validate-wiki.mjs.gz.b64").read_bytes())
)


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

    def run_installer(self, *arguments: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["python3", str(INSTALLER), "--root", str(self.project), *arguments],
            check=True,
            capture_output=True,
            text=True,
        )

    def run_installer_in_process(self, *, instructions: str = "auto") -> str:
        arguments = argparse.Namespace(
            root=self.project,
            instructions=instructions,
            no_package_script=False,
        )
        output = io.StringIO()
        with mock.patch.object(SETUP_PROJECT, "parse_args", return_value=arguments):
            with contextlib.redirect_stdout(output):
                self.assertEqual(SETUP_PROJECT.main(), 0)
        return output.getvalue()

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

    def task_snapshot(self) -> dict[str, tuple[str, bytes | str]]:
        tasks = self.project / "docs" / "tasks"
        snapshot = {}
        for path in sorted(tasks.rglob("*")):
            relative = path.relative_to(tasks).as_posix()
            if path.is_symlink():
                snapshot[relative] = ("symlink", path.readlink().as_posix())
            elif path.is_file():
                snapshot[relative] = ("file", path.read_bytes())
            elif path.is_dir():
                snapshot[relative] = ("directory", b"")
        return snapshot

    def make_legacy_project(self, legacy_validator: bytes) -> None:
        self.run_installer()
        shutil.rmtree(self.project / "docs" / "backlog")
        (self.project / "scripts" / "validate-project.mjs").unlink()
        (self.project / ".setup-project.json").unlink()
        (self.project / "scripts" / "validate-wiki.mjs").write_bytes(legacy_validator)
        (self.project / "package.json").write_text(
            json.dumps(
                {
                    "name": "legacy-project",
                    "scripts": {"wiki:check": "node scripts/validate-wiki.mjs"},
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )

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

    def test_generated_legacy_project_upgrades_without_touching_wiki_or_tasks(self) -> None:
        legacy_validator = LEGACY_VALIDATOR
        self.make_legacy_project(legacy_validator)
        instructions = self.project / "AGENTS.md"
        instructions.write_text(
            "# User instructions\n\nBefore block.\n\n"
            + LEGACY_INSTRUCTIONS
            + "\n\nBetween blocks.\n\n"
            + LEGACY_INSTRUCTIONS
            + "\n\nAfter block.\n",
            encoding="utf-8",
        )
        tasks = self.project / "docs" / "tasks"
        (tasks / "legacy-plan").mkdir(parents=True)
        (tasks / ".gitignore").write_bytes(b"!keep-this-rule\n")
        (tasks / "legacy-plan" / "000-overview.md").write_bytes(b"legacy plan\n")
        (tasks / "plan-link").symlink_to("legacy-plan")
        start_here = self.project / "docs" / "wiki" / "start-here.md"
        start_here.write_text(
            start_here.read_text(encoding="utf-8")
            + "\n## Accepted project knowledge\n\nPreserve this project-specific fact.\n",
            encoding="utf-8",
        )
        wiki_before = {
            path.relative_to(self.project / "docs" / "wiki").as_posix(): path.read_bytes()
            for path in (self.project / "docs" / "wiki").rglob("*")
            if path.is_file()
        }
        tasks_before = self.task_snapshot()

        first = self.run_installer_in_process()

        upgraded_instructions = instructions.read_text(encoding="utf-8")
        self.assertEqual(upgraded_instructions.count("<!-- setup-project:start -->"), 1)
        self.assertEqual(upgraded_instructions.count("<!-- setup-project:end -->"), 1)
        self.assertNotIn("setup-wiki:", upgraded_instructions)
        for user_text in ("Before block.", "Between blocks.", "After block."):
            self.assertIn(user_text, upgraded_instructions)
        self.assertFalse((self.project / "scripts" / "validate-wiki.mjs").exists())
        self.assertEqual(
            (self.project / "scripts" / "validate-project.mjs").read_bytes(),
            (SKILL_ROOT / "assets" / "validate-project.mjs").read_bytes(),
        )
        package = json.loads((self.project / "package.json").read_text(encoding="utf-8"))
        self.assertEqual(
            package["scripts"],
            {"project:check": "node scripts/validate-project.mjs"},
        )
        self.assertEqual(self.task_snapshot(), tasks_before)
        self.assertEqual(
            {
                path.relative_to(self.project / "docs" / "wiki").as_posix(): path.read_bytes()
                for path in (self.project / "docs" / "wiki").rglob("*")
                if path.is_file()
            },
            wiki_before,
        )
        self.assertIn("removed", first)
        self.assertIn("legacy validator", first)
        self.assertEqual(self.validate().returncode, 0)

        before_second_run = self.snapshot()
        second = self.run_installer_in_process()
        self.assertEqual(self.snapshot(), before_second_run)
        self.assertNotIn("created", second)
        self.assertNotIn("updated", second)
        self.assertNotIn("removed", second)

    def test_customized_upgrade_collisions_are_preserved_and_reported(self) -> None:
        legacy_validator = b"custom legacy validator\n"
        self.make_legacy_project(legacy_validator)
        canonical = self.project / "scripts" / "validate-project.mjs"
        canonical.write_bytes(b"custom project validator\n")
        package = self.project / "package.json"
        package.write_text(
            json.dumps(
                {
                    "name": "legacy-project",
                    "scripts": {
                        "wiki:check": "custom-wiki-command",
                        "project:check": "custom-project-command",
                    },
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
        before = {
            "canonical": canonical.read_bytes(),
            "legacy": (self.project / "scripts" / "validate-wiki.mjs").read_bytes(),
            "package": package.read_bytes(),
        }

        output = self.run_installer_in_process()

        self.assertEqual(canonical.read_bytes(), before["canonical"])
        self.assertEqual(
            (self.project / "scripts" / "validate-wiki.mjs").read_bytes(),
            before["legacy"],
        )
        self.assertEqual(package.read_bytes(), before["package"])
        self.assertIn("preserved customized project validator", output)
        self.assertIn("preserved customized legacy validator", output)
        self.assertIn("preserved customized package script wiki:check", output)
        self.assertIn("package scripts were not migrated", output)

        before_second_run = self.snapshot()
        self.run_installer_in_process()
        self.assertEqual(self.snapshot(), before_second_run)

    def test_package_variants_preserve_custom_values_and_reuse_canonical_command(self) -> None:
        self.run_installer()
        package_path = self.project / "package.json"
        package_path.write_text(
            json.dumps(
                {
                    "scripts": {
                        "wiki:check": "custom-wiki-command",
                        "project:check": "custom-project-command",
                        "verify": "node scripts/validate-project.mjs",
                    }
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )

        output = self.run_installer().stdout

        scripts = json.loads(package_path.read_text(encoding="utf-8"))["scripts"]
        self.assertEqual(scripts["wiki:check"], "custom-wiki-command")
        self.assertEqual(scripts["project:check"], "custom-project-command")
        self.assertEqual(scripts["verify"], "node scripts/validate-project.mjs")
        self.assertEqual(len(scripts), 3)
        self.assertIn("preserved customized package script wiki:check", output)

    def test_exact_legacy_script_does_not_overwrite_custom_new_script(self) -> None:
        self.run_installer()
        package_path = self.project / "package.json"
        package_path.write_text(
            json.dumps(
                {
                    "scripts": {
                        "wiki:check": "node scripts/validate-wiki.mjs",
                        "project:check": "custom-project-command",
                    }
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )

        self.run_installer()

        scripts = json.loads(package_path.read_text(encoding="utf-8"))["scripts"]
        self.assertNotIn("wiki:check", scripts)
        self.assertEqual(scripts["project:check"], "custom-project-command")
        self.assertEqual(
            scripts["project:validate"], "node scripts/validate-project.mjs"
        )

    def test_explicit_instruction_selection_leaves_other_file_unchanged(self) -> None:
        agents = self.project / "AGENTS.md"
        claude = self.project / "CLAUDE.md"
        agents.write_text("Agents user content.\n\n" + LEGACY_INSTRUCTIONS + "\n", encoding="utf-8")
        claude.write_text("Claude user content.\n\n" + LEGACY_INSTRUCTIONS + "\n", encoding="utf-8")
        agents_before = agents.read_bytes()

        self.run_installer("--instructions", "claude")

        self.assertEqual(agents.read_bytes(), agents_before)
        self.assertIn("<!-- setup-project:start -->", claude.read_text(encoding="utf-8"))
        self.assertNotIn("setup-wiki:", claude.read_text(encoding="utf-8"))

    def test_both_instruction_files_receive_project_routing_rules(self) -> None:
        self.run_installer("--instructions", "both")

        for name in ("AGENTS.md", "CLAUDE.md"):
            instructions = (self.project / name).read_text(encoding="utf-8")
            self.assertIn("`docs/wiki` owns accepted primary-branch state", instructions)
            self.assertIn("Use `$backlog` for backlog mutations", instructions)
            self.assertIn("`$to-wiki` for accepted wiki updates", instructions)
            self.assertIn("node scripts/validate-project.mjs", instructions)

        before = {
            name: (self.project / name).read_bytes()
            for name in ("AGENTS.md", "CLAUDE.md")
        }
        self.run_installer("--instructions", "both")
        self.assertEqual(
            {
                name: (self.project / name).read_bytes()
                for name in ("AGENTS.md", "CLAUDE.md")
            },
            before,
        )

    def test_github_actions_adds_standalone_workflow_without_rewriting_existing_jobs(self) -> None:
        workflows = self.project / ".github" / "workflows"
        workflows.mkdir(parents=True)
        existing = workflows / "build.yml"
        existing.write_bytes(b"name: Existing build\njobs: {}\n")
        existing_before = existing.read_bytes()

        self.run_installer()

        managed = workflows / "project-validation.yml"
        self.assertEqual(existing.read_bytes(), existing_before)
        self.assertIn(
            "node scripts/validate-project.mjs", managed.read_text(encoding="utf-8")
        )
        manifest = json.loads(
            (self.project / ".setup-project.json").read_text(encoding="utf-8")
        )
        self.assertIn(
            ".github/workflows/project-validation.yml", manifest["managed_assets"]
        )
        before_second_run = self.snapshot()
        self.run_installer()
        self.assertEqual(self.snapshot(), before_second_run)

    def test_github_actions_custom_workflow_is_preserved(self) -> None:
        workflows = self.project / ".github" / "workflows"
        workflows.mkdir(parents=True)
        target = workflows / "project-validation.yml"
        target.write_bytes(b"custom workflow\n")

        output = self.run_installer().stdout

        self.assertEqual(target.read_bytes(), b"custom workflow\n")
        self.assertIn("preserved customized GitHub Actions workflow", output)

    def test_gitlab_compatible_include_list_gets_narrow_managed_integration(self) -> None:
        config = self.project / ".gitlab-ci.yml"
        original = (
            "include:\n"
            "  - template: Security/SAST.gitlab-ci.yml\n"
            "\n"
            "build:\n"
            "  script: make build\n"
        )
        config.write_text(original, encoding="utf-8")

        self.run_installer()

        updated = config.read_text(encoding="utf-8")
        self.assertIn("template: Security/SAST.gitlab-ci.yml", updated)
        self.assertIn("setup-project:gitlab-include:start", updated)
        self.assertIn("build:\n  script: make build\n", updated)
        job = self.project / ".gitlab" / "ci" / "project-validation.yml"
        self.assertIn("node scripts/validate-project.mjs", job.read_text(encoding="utf-8"))
        before_second_run = self.snapshot()
        self.run_installer()
        self.assertEqual(self.snapshot(), before_second_run)

    def test_gitlab_without_include_adds_standalone_managed_include(self) -> None:
        config = self.project / ".gitlab-ci.yml"
        config.write_bytes(b"build:\n  script: make build\n")

        self.run_installer()

        updated = config.read_text(encoding="utf-8")
        self.assertTrue(updated.startswith("build:\n  script: make build\n"))
        self.assertIn("include:\n  - local: '.gitlab/ci/project-validation.yml'", updated)

    def test_unsupported_gitlab_include_is_reported_without_ci_mutation(self) -> None:
        config = self.project / ".gitlab-ci.yml"
        config.write_bytes(b"include: remote-pipeline.yml\nbuild:\n  script: make build\n")
        before = config.read_bytes()

        output = self.run_installer().stdout

        self.assertEqual(config.read_bytes(), before)
        self.assertFalse((self.project / ".gitlab").exists())
        self.assertIn("preserved unsupported .gitlab-ci.yml", output)

    def test_custom_gitlab_job_prevents_include_mutation(self) -> None:
        config = self.project / ".gitlab-ci.yml"
        config.write_bytes(b"build:\n  script: make build\n")
        custom_job = self.project / ".gitlab" / "ci" / "project-validation.yml"
        custom_job.parent.mkdir(parents=True)
        custom_job.write_bytes(b"custom validation job\n")
        before = config.read_bytes()

        output = self.run_installer().stdout

        self.assertEqual(config.read_bytes(), before)
        self.assertEqual(custom_job.read_bytes(), b"custom validation job\n")
        self.assertIn("standalone project-validation job is customized", output)

    def test_unmatched_instruction_markers_are_preserved_for_manual_reconciliation(self) -> None:
        instructions = self.project / "AGENTS.md"
        instructions.write_bytes(b"User text\n<!-- setup-wiki:start -->\ncustom block\n")
        before = instructions.read_bytes()

        output = self.run_installer().stdout

        self.assertEqual(instructions.read_bytes(), before)
        self.assertIn("unmatched setup-project or setup-wiki instruction markers", output)

    def test_manifest_hash_authorizes_future_managed_asset_upgrade(self) -> None:
        target = self.project / "managed.txt"
        target.write_bytes(b"version one\n")
        manifest = {
            "managed_assets": {
                "managed.txt": hashlib.sha256(b"version one\n").hexdigest()
            }
        }

        status, managed = SETUP_PROJECT.install_managed_asset(
            self.project,
            target,
            b"version two\n",
            manifest,
            [],
            "test asset",
        )

        self.assertEqual(status, "updated")
        self.assertTrue(managed)
        self.assertEqual(target.read_bytes(), b"version two\n")

    def test_historical_legacy_validator_fingerprint_is_fixed(self) -> None:
        self.assertEqual(
            hashlib.sha256(LEGACY_VALIDATOR).hexdigest(),
            SETUP_PROJECT.LEGACY_VALIDATOR_SHA256,
        )
        self.assertEqual(
            SETUP_PROJECT.LEGACY_VALIDATOR_SHA256,
            "6fc13dc082442435234b7e71db3559045a6956d1bf64bbaf827aa065ed1fcd2c",
        )

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
        self.assertIn("wiki_refs references missing docs/wiki/missing.md", validation.stderr)
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
