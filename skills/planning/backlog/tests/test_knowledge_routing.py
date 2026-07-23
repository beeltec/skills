#!/usr/bin/env python3

import subprocess
import tempfile
import unittest
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[4]
SKILLS = REPOSITORY_ROOT / "skills"
INSTALLER = (
    SKILLS
    / "workflows"
    / "setup-project"
    / "scripts"
    / "setup_project.py"
)


def read(relative: str) -> str:
    return (REPOSITORY_ROOT / relative).read_text(encoding="utf-8")


class KnowledgeRoutingContractTests(unittest.TestCase):
    def test_discussion_routes_by_knowledge_state(self) -> None:
        skill = read("skills/planning/discuss/SKILL.md")

        self.assertIn("Ask the questions one at a time", skill)
        self.assertIn("When `docs/wiki` is present", skill)
        self.assertIn("Offer `$backlog`", skill)
        self.assertIn("already describes accepted current primary-branch state", skill)
        self.assertIn("Do not recommend publishing its target specification", skill)

    def test_to_wiki_accepts_current_state_and_rejects_proposals(self) -> None:
        skill = read("skills/planning/to-wiki/SKILL.md")

        self.assertIn("Require the complete relevant `$setup-project` scaffold", skill)
        self.assertIn("Reject proposed features", skill)
        self.assertIn("Prefer a completed or cancelled archived record", skill)
        self.assertIn("do not copy its desired delta", skill)
        self.assertIn("node scripts/validate-project.mjs", skill)

    def test_research_output_belongs_to_proposed_backlog_work(self) -> None:
        skill = read("skills/workflows/research-tech-stack/SKILL.md")
        template = read(
            "skills/workflows/research-tech-stack/assets/backlog-research.md"
        )
        metadata = read(
            "skills/workflows/research-tech-stack/agents/openai.yaml"
        )

        self.assertIn("one named `EPIC-NNN` or `WORK-NNN`", skill)
        self.assertIn("with `status: proposed`", skill)
        self.assertIn("Do not create or update a wiki technology page during planning", skill)
        self.assertIn("Treat `pending` research as a hard readiness failure", skill)
        self.assertIn("During implementation reconciliation", skill)
        for heading in (
            "Repository and version evidence",
            "Findings and recommendations",
            "Uncertainty and readiness",
            "Project deviations",
            "Sources",
        ):
            self.assertIn(heading, template)
        self.assertIn("named proposed Epic or work item", metadata)

    def test_planning_workflows_remain_on_the_selected_branch(self) -> None:
        authorization = read(
            "skills/workflows/create-conventional-branch/SKILL.md"
        )

        for workflow in (
            "$setup-project",
            "$backlog",
            "$discuss",
            "$to-wiki",
            "$research-tech-stack",
        ):
            self.assertIn(workflow, authorization)
        self.assertIn("Only the implementation workflows", authorization)

    def test_affected_workflows_use_consolidated_terminology(self) -> None:
        affected = "\n".join(
            read(path)
            for path in (
                "skills/planning/discuss/SKILL.md",
                "skills/planning/to-wiki/SKILL.md",
                "skills/workflows/research-tech-stack/SKILL.md",
                "skills/workflows/create-conventional-branch/SKILL.md",
            )
        )

        for obsolete in ("$setup-wiki", "validate-wiki.mjs", "$to-tasks"):
            self.assertNotIn(obsolete, affected)
        self.assertIn("$setup-project", affected)
        self.assertIn("node scripts/validate-project.mjs", affected)

    def test_pending_research_blocks_ready_work(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            project = Path(temporary_directory) / "project"
            project.mkdir()
            subprocess.run(
                [
                    "python3",
                    str(INSTALLER),
                    "--root",
                    str(project),
                    "--no-package-script",
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            backlog = project / "docs" / "backlog"
            work = backlog / "standalone" / "WORK-001-research-gate.md"
            work.write_text(
                """---
id: WORK-001
type: task
title: Verify proposal research gate
status: ready
parent: none
outcome: Deliver a bounded result after resolving technical evidence
wiki_refs: [none]
research: pending
blocks: []
clones: []
duplicates: []
relates_to: []
causes: []
claim: none
claim_expires: none
cancelled_reason: none
---

# WORK-001: Verify proposal research gate

## Outcome / delta

Deliver a bounded result after resolving technical evidence.

## Acceptance criteria

- [ ] Project validation confirms the implemented result.

## Relationships

No relationships apply.

## Wiki references

No accepted-state page applies.

## Research

Version applicability remains unresolved, so research is pending.

## Execution

The project owner explicitly approved the approach. Verification command: node scripts/validate-project.mjs.

## Subtasks

- [ ] Resolve the version-specific evidence.
""",
                encoding="utf-8",
            )
            (backlog / "standalone" / "index.md").write_text(
                "# Active standalone work\n\n"
                "- [WORK-001](WORK-001-research-gate.md) - Research gate fixture.\n",
                encoding="utf-8",
            )
            index = backlog / "index.md"
            index.write_text(
                index.read_text(encoding="utf-8").replace(
                    "No executable work is ranked. Add every active `WORK-NNN` exactly once as an ordered Markdown link; position 1 is the next work item.",
                    "1. [WORK-001](standalone/WORK-001-research-gate.md)",
                ),
                encoding="utf-8",
            )

            validation = subprocess.run(
                ["node", "scripts/validate-project.mjs"],
                cwd=project,
                capture_output=True,
                text=True,
            )

        self.assertNotEqual(validation.returncode, 0)
        self.assertIn(
            "ready work research must be complete or not-needed",
            validation.stderr,
        )


if __name__ == "__main__":
    unittest.main()
