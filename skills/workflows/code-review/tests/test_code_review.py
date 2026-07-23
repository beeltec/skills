#!/usr/bin/env python3

import unittest
from pathlib import Path


SKILL_ROOT = Path(__file__).resolve().parents[1]
SKILL = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8")
METADATA = (SKILL_ROOT / "agents" / "openai.yaml").read_text(encoding="utf-8")


class CodeReviewContractTests(unittest.TestCase):
    def test_preserves_fixed_point_merge_base_and_empty_diff_preflight(self) -> None:
        self.assertIn("git rev-parse --verify <fixed-point>^{commit}", SKILL)
        self.assertIn("git merge-base <fixed-point> HEAD", SKILL)
        self.assertIn("git diff <fixed-point>...HEAD", SKILL)
        self.assertIn("git log <fixed-point>..HEAD --oneline", SKILL)
        self.assertIn("If it is empty", SKILL)
        self.assertIn("stop before starting sub-agents", SKILL)

    def test_explicit_work_item_selection_precedes_discovery(self) -> None:
        explicit = SKILL.index("If the user supplied a `WORK-NNN`")
        discovery = SKILL.index("Otherwise inspect active work records")

        self.assertLess(explicit, discovery)
        self.assertIn("Explicit selection wins", SKILL)
        self.assertIn("Never infer desired behavior from a feature-named wiki page", SKILL)

    def test_live_claim_and_branch_discovery_refuse_ambiguity(self) -> None:
        self.assertIn("live, unexpired execution claim", SKILL)
        self.assertIn("Execution or Provenance section names the exact current branch", SKILL)
        self.assertIn("Ignore expired claims", SKILL)
        self.assertIn("only when the combined evidence identifies exactly one candidate", SKILL)
        self.assertIn("list each candidate and its claim/branch evidence", SKILL)
        self.assertIn("ask the user to choose", SKILL)

    def test_epic_wiki_and_research_context_is_loaded_completely(self) -> None:
        packet = SKILL[SKILL.index("### 4. Build the authority packet") :]

        self.assertIn("Read every authority completely", packet)
        self.assertIn("complete parent Epic", packet)
        self.assertIn("every linked current-state wiki concept", packet)
        self.assertIn("proposal-specific research", packet)
        self.assertIn("do not expand or replace child scope", packet)

    def test_absent_spec_requires_explicit_confirmation(self) -> None:
        self.assertIn("ask the user to confirm that no specification is available", SKILL)
        self.assertIn("Only after that explicit confirmation", SKILL)
        self.assertIn("skip the Spec sub-agent", SKILL)
        self.assertIn("report `no spec available`", SKILL)

    def test_conflicting_wiki_and_backlog_evidence_keeps_authorities_separate(self) -> None:
        self.assertIn("cannot satisfy or erase a missing desired delta", SKILL)
        self.assertIn("Backlog scope never waives", SKILL)
        self.assertIn("never let existing behavior mask a missing desired delta", SKILL)
        self.assertIn("leave that conflict visible for the separate Standards axis", SKILL)

    def test_parallel_axes_cite_authority_and_report_independently(self) -> None:
        self.assertIn("single message with two `Agent` tool calls", SKILL)
        self.assertIn("citing the accepted wiki or repository source path and exact rule", SKILL)
        self.assertIn("Cite the work-item path and exact requirement", SKILL)
        self.assertIn("missing or partial", SKILL)
        self.assertIn("implemented behavior that is incorrect", SKILL)
        self.assertIn("scope creep", SKILL)
        self.assertIn("Keep severity labels and finding counts independent", SKILL)
        self.assertIn("Do **not** merge or rerank findings", SKILL)

    def test_metadata_describes_backlog_backed_review(self) -> None:
        self.assertIn("active backlog work item", METADATA)
        self.assertNotIn("originating spec", METADATA)


if __name__ == "__main__":
    unittest.main()
