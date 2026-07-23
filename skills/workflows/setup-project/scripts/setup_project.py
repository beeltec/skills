#!/usr/bin/env python3

import argparse
import hashlib
import json
import re
from datetime import datetime
from pathlib import Path


LEGACY_MANIFEST_NAME = ".setup-project.json"
CANONICAL_COMMAND = "node scripts/validate-project.mjs"
LEGACY_COMMAND = "node scripts/validate-wiki.mjs"
LEGACY_VALIDATOR_SHA256 = (
    "6fc13dc082442435234b7e71db3559045a6956d1bf64bbaf827aa065ed1fcd2c"
)
MANAGED_BLOCK = re.compile(
    r"<!-- setup-(?P<owner>project|wiki):start -->.*?"
    r"<!-- setup-(?P=owner):end -->",
    re.DOTALL,
)
MANAGED_MARKERS = re.compile(r"<!-- setup-(?:project|wiki):(?:start|end) -->")
GITLAB_INCLUDE_START = "# setup-project:gitlab-include:start"
GITLAB_INCLUDE_END = "# setup-project:gitlab-include:end"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Initialize project knowledge and backlog governance."
    )
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="Project root")
    parser.add_argument(
        "--instructions",
        choices=("auto", "agents", "claude", "both"),
        default="auto",
        help="Instruction files to create or update",
    )
    parser.add_argument(
        "--no-package-script",
        action="store_true",
        help="Do not add a project validation command to package.json",
    )
    return parser.parse_args()


def project_name(root: Path) -> str:
    package_json = root / "package.json"
    if package_json.is_file():
        try:
            package_name = json.loads(package_json.read_text(encoding="utf-8")).get(
                "name"
            )
            if isinstance(package_name, str) and package_name.strip():
                raw_name = package_name.rsplit("/", 1)[-1]
                return raw_name.replace("-", " ").replace("_", " ").title()
        except (json.JSONDecodeError, OSError):
            pass

    return root.name.replace("-", " ").replace("_", " ").title()


def render(template: str, replacements: dict[str, str]) -> str:
    rendered = template
    for marker, value in replacements.items():
        rendered = rendered.replace("{{" + marker + "}}", value)
    return rendered


def normalize_generated_values(content: str) -> str:
    normalized = re.sub(r"^timestamp: .+$", "timestamp: {{TIMESTAMP}}", content, flags=re.MULTILINE)
    return re.sub(
        r"^## \d{4}-\d{2}-\d{2}$", "## {{DATE}}", normalized, flags=re.MULTILINE
    )


def write_missing(target: Path, content: str, *, generated_values: bool = False) -> str:
    if target.exists():
        existing = target.read_text(encoding="utf-8")
        if generated_values:
            existing = normalize_generated_values(existing)
            content = normalize_generated_values(content)
        return "unchanged" if existing == content else "kept"

    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")
    return "created"


def sha256(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def relative_path(root: Path, target: Path) -> str:
    return target.relative_to(root).as_posix()


def remove_legacy_manifest(root: Path, notes: list[str]) -> tuple[str, Path] | None:
    target = root / LEGACY_MANIFEST_NAME
    if not target.exists():
        return None
    try:
        manifest = json.loads(target.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        manifest = None
    if isinstance(manifest, dict) and manifest.get("installer") == "setup-project":
        target.unlink()
        return "removed", target
    notes.append(
        f"Manual action: preserved {LEGACY_MANIFEST_NAME}; it is not owned by "
        "setup-project."
    )
    return "kept", target


def install_managed_asset(
    root: Path,
    target: Path,
    content: bytes,
    notes: list[str],
    kind: str,
) -> tuple[str, bool]:
    relative = relative_path(root, target)
    if not target.exists():
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
        return "created", True

    if sha256(target.read_bytes()) == sha256(content):
        return "unchanged", True

    notes.append(
        f"Manual action: preserved customized {kind} at {relative}; "
        "reconcile it with the setup-project asset."
    )
    return "kept", False


def instruction_targets(root: Path, selection: str) -> list[Path]:
    agents = root / "AGENTS.md"
    claude = root / "CLAUDE.md"

    if selection == "agents":
        return [agents]
    if selection == "claude":
        return [claude]
    if selection == "both":
        return [agents, claude]

    existing = [candidate for candidate in (agents, claude) if candidate.exists()]
    return existing or [agents]


def update_instructions(target: Path, block: str, notes: list[str]) -> str:
    if target.exists():
        original = target.read_text(encoding="utf-8")
        matches = list(MANAGED_BLOCK.finditer(original))
        marker_count = len(MANAGED_MARKERS.findall(original))
        if marker_count != len(matches) * 2:
            notes.append(
                f"Manual action: preserved {target.name}; it has unmatched setup-project "
                "or setup-wiki instruction markers."
            )
            return "kept"
        if matches:
            pieces = []
            cursor = 0
            for index, match in enumerate(matches):
                pieces.append(original[cursor : match.start()])
                if index == 0:
                    pieces.append(block.strip())
                cursor = match.end()
            pieces.append(original[cursor:])
            updated = "".join(pieces)
        else:
            updated = original.rstrip() + "\n\n" + block.strip() + "\n"
    else:
        updated = "# Agent instructions\n\n" + block.strip() + "\n"

    if target.exists() and target.read_text(encoding="utf-8") == updated:
        return "unchanged"

    target.write_text(updated, encoding="utf-8")
    return "updated" if target.exists() else "created"


def install_validator(
    root: Path, source: Path, notes: list[str]
) -> tuple[list[tuple[str, Path, str]], bool]:
    target = root / "scripts" / "validate-project.mjs"
    status, canonical_ready = install_managed_asset(
        root,
        target,
        source.read_bytes(),
        notes,
        "project validator",
    )
    results = [(status, target, "validator")]

    legacy = root / "scripts" / "validate-wiki.mjs"
    if legacy.exists():
        legacy_owned = sha256(legacy.read_bytes()) == LEGACY_VALIDATOR_SHA256
        if legacy_owned and canonical_ready:
            legacy.unlink()
            results.append(("removed", legacy, "legacy validator"))
        elif legacy_owned:
            notes.append(
                "Manual action: kept the installer-owned scripts/validate-wiki.mjs "
                "because the canonical validator has a customization collision."
            )
            results.append(("kept", legacy, "legacy validator"))
        else:
            notes.append(
                "Manual action: preserved customized legacy validator at "
                "scripts/validate-wiki.mjs; remove it only after reconciling its behavior."
            )
            results.append(("kept", legacy, "legacy validator"))
    return results, canonical_ready


def add_package_script(
    root: Path, canonical_ready: bool, notes: list[str]
) -> tuple[str, str, str | None]:
    package_json = root / "package.json"
    if not package_json.exists():
        return "skipped", "package.json not found", None

    try:
        data = json.loads(package_json.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as error:
        return "skipped", f"package.json could not be parsed: {error}", None

    if not isinstance(data, dict):
        return "skipped", "package.json root is not an object", None

    scripts = data.setdefault("scripts", {})
    if not isinstance(scripts, dict):
        return "skipped", "package.json scripts is not an object", None

    legacy_exact = scripts.get("wiki:check") == LEGACY_COMMAND
    if scripts.get("wiki:check") not in (None, LEGACY_COMMAND):
        notes.append(
            "Manual action: preserved customized package script wiki:check: "
            f"{scripts['wiki:check']}"
        )

    canonical_entry = next(
        ((name, value) for name, value in scripts.items() if value == CANONICAL_COMMAND),
        None,
    )
    if not canonical_ready:
        notes.append(
            "Manual action: package scripts were not migrated because the canonical "
            "project validator is not installer-managed."
        )
        return "kept", "validator collision prevented package-script migration", None

    changed = False
    if legacy_exact:
        del scripts["wiki:check"]
        changed = True

    if canonical_entry is not None:
        name = canonical_entry[0]
        if not changed:
            return "unchanged", f"{name} already configured", name
    else:
        candidates = ["project:check", "project:validate", "validate:project"]
        name = next((candidate for candidate in candidates if candidate not in scripts), None)
        suffix = 2
        while name is None:
            candidate = f"project:check:{suffix}"
            if candidate not in scripts:
                name = candidate
            suffix += 1
        scripts[name] = CANONICAL_COMMAND
        changed = True

    if changed:
        package_json.write_text(
            json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )
    detail = f"added {name}" if not legacy_exact else f"configured {name}"
    if legacy_exact:
        detail += " and removed installer-owned wiki:check"
    return "updated", detail, name


def github_workflow() -> bytes:
    return b"""# Managed by setup-project. Changes are preserved as project customizations.
name: Project validation

on:
  push:
  pull_request:

jobs:
  validate-project:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: node scripts/validate-project.mjs
"""


def gitlab_job() -> bytes:
    return b"""# Managed by setup-project. Changes are preserved as project customizations.
\"setup-project:validate\":
  stage: test
  image: node:20
  script:
    - node scripts/validate-project.mjs
"""


def gitlab_include_update(content: str) -> tuple[str | None, str]:
    managed = re.compile(
        rf"(?ms)^\s*{re.escape(GITLAB_INCLUDE_START)}$.*?"
        rf"^\s*{re.escape(GITLAB_INCLUDE_END)}\s*$"
    )
    if GITLAB_INCLUDE_START in content or GITLAB_INCLUDE_END in content:
        match = managed.search(content)
        if match and ".gitlab/ci/project-validation.yml" in match.group(0):
            return content, "managed include already configured"
        return None, "managed GitLab include markers are incomplete or customized"

    include_headers = list(re.finditer(r"(?m)^include\s*:(.*)$", content))
    if not include_headers:
        separator = "" if not content or content.endswith("\n\n") else "\n"
        block = (
            f"{GITLAB_INCLUDE_START}\n"
            "include:\n"
            "  - local: '.gitlab/ci/project-validation.yml'\n"
            f"{GITLAB_INCLUDE_END}\n"
        )
        return content + separator + block, "added standalone managed include"
    if len(include_headers) != 1 or include_headers[0].group(1).strip():
        return None, "only one top-level block-list include is supported"

    header = include_headers[0]
    block_start = header.end()
    next_top_level = re.search(r"(?m)^(?![ \t\r\n#])[^\r\n]*", content[block_start:])
    block_end = block_start + (
        next_top_level.start() if next_top_level else len(content[block_start:])
    )
    block = content[block_start:block_end]
    meaningful = [
        line
        for line in block.splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    ]
    if not meaningful or not all(
        re.match(r"^  -\s+", line) or re.match(r"^ {4,}\S", line)
        for line in meaningful
    ):
        return None, "the existing include is not a simple block list"
    if re.search(
        r"(?m)^\s*-\s+local:\s*['\"]?\.gitlab/ci/project-validation\.yml['\"]?\s*$",
        block,
    ):
        return content, "existing local include already configured"

    insertion = (
        f"  {GITLAB_INCLUDE_START}\n"
        "  - local: '.gitlab/ci/project-validation.yml'\n"
        f"  {GITLAB_INCLUDE_END}\n"
    )
    prefix = content[:block_end]
    separator = "" if prefix.endswith("\n") else "\n"
    return prefix + separator + insertion + content[block_end:], "extended compatible include list"


def install_ci(root: Path, notes: list[str]) -> list[tuple[str, Path, str]]:
    results = []

    github_directory = root / ".github" / "workflows"
    if github_directory.is_dir():
        target = github_directory / "project-validation.yml"
        status, _ = install_managed_asset(
            root, target, github_workflow(), notes, "GitHub Actions workflow"
        )
        results.append((status, target, "GitHub Actions"))

    gitlab_config = root / ".gitlab-ci.yml"
    if gitlab_config.is_file():
        original = gitlab_config.read_text(encoding="utf-8")
        updated, detail = gitlab_include_update(original)
        if updated is None:
            notes.append(
                f"Manual action: preserved unsupported .gitlab-ci.yml ({detail}); "
                "include .gitlab/ci/project-validation.yml manually."
            )
            results.append(("kept", gitlab_config, "GitLab CI"))
        else:
            target = root / ".gitlab" / "ci" / "project-validation.yml"
            status, managed = install_managed_asset(
                root, target, gitlab_job(), notes, "GitLab CI job"
            )
            if not managed:
                notes.append(
                    "Manual action: .gitlab-ci.yml was not changed because the standalone "
                    "project-validation job is customized."
                )
                results.append(("kept", gitlab_config, "GitLab CI"))
            else:
                if updated != original:
                    gitlab_config.write_text(updated, encoding="utf-8")
                    results.append(("updated", gitlab_config, "GitLab CI"))
                else:
                    results.append(("unchanged", gitlab_config, "GitLab CI"))
                results.append((status, target, "GitLab CI job"))

    return results


def main() -> int:
    args = parse_args()
    root = args.root.expanduser().resolve()
    if not root.is_dir():
        raise SystemExit(f"Project root is not a directory: {root}")

    skill_root = Path(__file__).resolve().parents[1]
    assets = skill_root / "assets"
    wiki_assets = assets / "wiki"
    now = datetime.now().astimezone().replace(microsecond=0)
    replacements = {
        "PROJECT_NAME": project_name(root),
        "DATE": now.date().isoformat(),
        "TIMESTAMP": now.isoformat(),
    }
    notes: list[str] = []

    results: list[tuple[str, Path, str]] = []
    for source in sorted(wiki_assets.rglob("*.md")):
        relative = source.relative_to(wiki_assets)
        content = render(source.read_text(encoding="utf-8"), replacements)
        target = root / "docs" / "wiki" / relative
        results.append(
            (
                write_missing(target, content, generated_values=True),
                target,
                "wiki asset",
            )
        )

    backlog_assets = assets / "backlog"
    for source in sorted(backlog_assets.rglob("*.md")):
        relative = source.relative_to(backlog_assets)
        target = root / "docs" / "backlog" / relative
        results.append(
            (
                write_missing(target, source.read_text(encoding="utf-8")),
                target,
                "backlog asset",
            )
        )

    validator_source = assets / "validate-project.mjs"
    validator_results, canonical_ready = install_validator(root, validator_source, notes)
    results.extend(validator_results)

    instruction_block = (assets / "agent-instructions.md").read_text(
        encoding="utf-8"
    )
    created_instruction_targets = []
    for target in instruction_targets(root, args.instructions):
        existed = target.exists()
        status = update_instructions(target, instruction_block, notes)
        if not existed and status == "updated":
            status = "created"
        if status == "created":
            created_instruction_targets.append(target)
        results.append((status, target, "agent instructions"))

    agents_file = root / "AGENTS.md"
    claude_file = root / "CLAUDE.md"
    if (
        agents_file in created_instruction_targets
        and not claude_file.exists()
        and not claude_file.is_symlink()
    ):
        claude_file.symlink_to("AGENTS.md")
        results.append(("created", claude_file, "claude symlink"))

    if not args.no_package_script:
        status, detail, _ = add_package_script(root, canonical_ready, notes)
        print(f"{status:9} {'package script':18} {detail}")

    results.extend(install_ci(root, notes))

    legacy_manifest_result = remove_legacy_manifest(root, notes)
    if legacy_manifest_result is not None:
        status, target = legacy_manifest_result
        results.append((status, target, "legacy manifest"))

    for status, target, kind in results:
        print(f"{status:9} {kind:18} {target.relative_to(root)}")

    kept = [target for status, target, _ in results if status == "kept"]
    if kept:
        print("\nExisting files were preserved; review them for missing project conventions:")
        for target in kept:
            print(f"- {target.relative_to(root)}")

    if notes:
        print("\nUpgrade notes:")
        for note in notes:
            print(f"- {note}")

    print("\nRun: node scripts/validate-project.mjs")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
