#!/usr/bin/env python3

import json
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
SKILL = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8")
METADATA = (SKILL_ROOT / "agents" / "openai.yaml").read_text(encoding="utf-8")
SCENARIOS = json.loads(
    (Path(__file__).parent / "fixtures" / "execution_scenarios.json").read_text(
        encoding="utf-8"
    )
)


class ImplementContractTests(unittest.TestCase):
    def test_metadata_accepts_work_items_and_epics(self) -> None:
        self.assertIn("WORK-NNN", SKILL.split("---", 2)[1])
        self.assertIn("EPIC-NNN", SKILL.split("---", 2)[1])
        self.assertIn("WORK-NNN or EPIC-NNN", METADATA)

    def test_preflight_reads_complete_authority_before_branching(self) -> None:
        preflight = SKILL[SKILL.index("## Preflight") : SKILL.index("## Epic Selection")]
        self.assertIn("Complete preflight before creating or switching a branch", preflight)
        self.assertIn("Read completely the selected records", preflight)
        self.assertIn("all records connected by parent or relationship", preflight)
        self.assertIn("every linked wiki concept", preflight)
        self.assertIn("proposal research and local evidence", preflight)
        self.assertIn("repository code and tests", preflight)

    def test_invalid_blocked_and_conflicting_work_stops_before_branch(self) -> None:
        for state in ("`proposed`, `done`, or `cancelled`", "unresolved inward `blocks`", "malformed record", "live claim owned by another executor"):
            self.assertIn(state, SKILL)
        self.assertIn("Do not use a separate blocked status", SKILL)
        self.assertIn("do not create a branch after rejection", SKILL)

    def test_epic_uses_rank_dependency_order_and_per_item_gates(self) -> None:
        self.assertIn("highest-ranked child of the Epic", SKILL)
        self.assertIn("Rank controls selection among actionable children", SKILL)
        self.assertIn("After each child's primary-branch completion", SKILL)
        self.assertIn("Primary-branch integration is a per-work-item gate", SKILL)
        self.assertIn("Do not create another work branch", SKILL)

    def test_claim_and_checklist_commits_are_transactional_and_coherent(self) -> None:
        self.assertIn("human or agent, unique session, and exact branch", SKILL)
        self.assertIn("move the work item `ready -> in-progress`", SKILL)
        self.assertIn("coherent, independently green increments", SKILL)
        self.assertIn("rather than forcing one commit per checkbox", SKILL)
        self.assertIn("one separate validated backlog transaction", SKILL)
        self.assertIn("only its backlog paths", SKILL)
        self.assertIn("Stage explicit intended paths only", SKILL)

    def test_review_reconciliation_and_validation_are_required(self) -> None:
        self.assertIn("invoke `$code-review` with the selected `WORK-NNN`", SKILL)
        self.assertIn("Repeat until both Standards and Spec pass", SKILL)
        self.assertIn("obtain project-owner approval", SKILL)
        self.assertIn("`wiki reconciliation: no update required`", SKILL)
        self.assertIn("run `node scripts/validate-project.mjs` plus the full applicable repository suite", SKILL)

    def test_done_follows_primary_acceptance_and_applies_archive_rules(self) -> None:
        merge = SKILL.index("Merge the one work branch into the primary branch")
        done = SKILL.index("set the item to `done`")
        self.assertLess(merge, done)
        self.assertIn("post-merge checks establish primary-branch acceptance", SKILL)
        self.assertIn("Move a standalone item to `archive/standalone/`", SKILL)
        self.assertIn("move its whole directory to `archive/epics/`", SKILL)
        self.assertIn("never split it across commits", SKILL)

    def test_owner_decisions_are_not_made_by_the_executor(self) -> None:
        self.assertIn("does not authorize changing outcome or acceptance wording", SKILL)
        self.assertIn("Preserve proposed cancellation and out-of-scope decisions", SKILL)
        self.assertIn("stop for project-owner approval", SKILL)

    def test_dry_run_scenarios_cover_required_outcomes(self) -> None:
        by_name = {scenario["name"]: scenario for scenario in SCENARIOS}
        expected = {
            "ready standalone item",
            "dependency-linked Epic",
            "blocked standalone item",
            "conflicting claim",
            "review failure",
            "wiki reconciliation required",
            "completion and archival",
        }
        self.assertEqual(set(by_name), expected)
        self.assertIn("complete WORK-001 before WORK-002 becomes actionable", by_name["dependency-linked Epic"]["expected"])
        self.assertIn("stop before branch creation", by_name["blocked standalone item"]["expected"])
        self.assertIn("without overwriting", by_name["conflicting claim"]["expected"])
        self.assertIn("repeat both review axes", by_name["review failure"]["expected"])
        self.assertIn("exact owner approval", by_name["wiki reconciliation required"]["expected"])
        self.assertIn("primary acceptance before done", by_name["completion and archival"]["expected"])


if __name__ == "__main__":
    unittest.main()
