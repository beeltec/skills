#!/usr/bin/env python3

import json
import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
SKILL = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8")
METADATA = (SKILL_ROOT / "agents" / "openai.yaml").read_text(encoding="utf-8")
SCENARIOS = json.loads(
    (Path(__file__).parent / "fixtures" / "orchestration_scenarios.json").read_text(
        encoding="utf-8"
    )
)


class ImplementWithSubagentsContractTests(unittest.TestCase):
    def test_inputs_are_epics_or_explicit_work_item_sets(self) -> None:
        frontmatter = SKILL.split("---", 2)[1]
        self.assertIn("EPIC-NNN", frontmatter)
        self.assertIn("WORK-NNN", frontmatter)
        self.assertIn("explicit non-empty set", SKILL)
        self.assertIn("does not authorize siblings", SKILL)
        self.assertNotIn("Require the master", SKILL)
        self.assertIn("Never create, inspect, migrate, or depend on `docs/tasks`", SKILL)
        self.assertNotIn("docs/tasks", METADATA)

    def test_explicit_invocation_and_passthrough_are_preserved(self) -> None:
        self.assertIn("Use only when the user explicitly invokes", SKILL)
        self.assertIn("Pass each supplied setting unchanged", SKILL)
        self.assertIn("interface cannot select one or both settings", SKILL)
        self.assertIn("never claim a requested setting was applied", SKILL)
        self.assertIn("allow_implicit_invocation: false", METADATA)

    def test_preflight_loads_and_validates_complete_authority(self) -> None:
        preflight = SKILL[SKILL.index("## Preflight") : SKILL.index("## Selection And Delegation")]
        for required in (
            "Run `node scripts/validate-project.mjs`",
            "complete global rank",
            "related parent Epics",
            "every record needed to calculate inward blockers",
            "all selected and Epic `wiki_refs`",
            "proposal research and local evidence",
            "claim owner/session/branch/expiry",
        ):
            self.assertIn(required, preflight)
        self.assertIn("missing or malformed records", preflight)
        self.assertIn("deadlocked frontier", preflight)
        self.assertIn("blocker outside the authorized set", preflight)

    def test_selection_uses_current_global_rank_and_actionability(self) -> None:
        selection = SKILL[SKILL.index("## Selection And Delegation") : SKILL.index("## Verification And Recovery")]
        self.assertIn("reload the records", selection.lower())
        self.assertIn("scan `## Global executable-work rank` from top to bottom", selection)
        self.assertIn("first authorized item", selection)
        self.assertIn("Rank chooses among currently actionable", selection)
        self.assertIn("links determine actionability", selection)
        self.assertIn("does not create an umbrella branch", selection)
        self.assertIn("exactly one fresh conventional branch", selection)

    def test_one_fresh_subagent_per_item_and_same_agent_recovery(self) -> None:
        self.assertIn("Spawn exactly one fresh subagent", SKILL)
        self.assertIn("never assign this subagent another work item", SKILL)
        self.assertIn("never have more than one implementation subagent running or paused", SKILL)
        self.assertIn("invoke and follow `/implement`", SKILL)
        self.assertIn("same assigned subagent", SKILL)
        self.assertIn("No replacement subagent", SKILL)

    def test_every_direct_implementation_gate_is_inspected(self) -> None:
        verification = SKILL[SKILL.index("## Verification And Recovery") : SKILL.index("## Epic Closure")]
        for evidence in (
            "complete diff and commits",
            "both backlog-aware code-review axes passed",
            "wiki update was required",
            "primary-branch acceptance before `done`",
            "claim is cleared",
            "absent from global rank",
            "archive location",
        ):
            self.assertIn(evidence, verification)
        self.assertIn("applied on the primary branch after acceptance", verification)
        self.assertIn("recalculate actionability", verification)

    def test_epic_closure_is_authorized_atomic_and_fully_gated(self) -> None:
        closure = SKILL[SKILL.index("## Epic Closure") : SKILL.index("## Invocation Examples")]
        self.assertIn("Only an explicit Epic input authorizes Epic closure", closure)
        self.assertIn("Epic outcome and success criteria", closure)
        self.assertIn("full applicable suite", closure)
        self.assertIn("same final atomic Epic completion transaction", closure)
        self.assertIn("Never split the archive", closure)
        self.assertIn("close an Epic after a mere selected-set run", closure)

    def test_metadata_and_examples_use_backlog_inputs(self) -> None:
        self.assertIn("EPIC-NNN or explicit WORK-NNN set", METADATA)
        examples = SKILL[SKILL.index("## Invocation Examples") :]
        self.assertIn("EPIC-012", examples)
        self.assertIn("WORK-014, WORK-019", examples)
        self.assertIn("reasoning effort high", examples)

    def test_scenarios_cover_required_orchestration_outcomes(self) -> None:
        by_name = {scenario["name"]: scenario for scenario in SCENARIOS}
        self.assertEqual(
            set(by_name),
            {
                "parallel-ready ranking",
                "dependency chain",
                "same-agent failure recovery",
                "conflicting claim",
                "claim cleanup gate",
                "cancellation decision",
                "final Epic closure",
            },
        )
        self.assertIn("WORK-005 first", by_name["parallel-ready ranking"]["expected"])
        self.assertIn("recalculate actionability", by_name["dependency chain"]["expected"])
        self.assertIn("same WORK-010 subagent", by_name["same-agent failure recovery"]["expected"])
        self.assertIn("never overwrite", by_name["conflicting claim"]["expected"])
        self.assertIn("claim", by_name["claim cleanup gate"]["state"])
        self.assertIn("project-owner approval", by_name["cancellation decision"]["expected"])
        self.assertIn("atomically mark done", by_name["final Epic closure"]["expected"])


if __name__ == "__main__":
    unittest.main()
