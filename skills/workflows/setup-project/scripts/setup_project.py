#!/usr/bin/env python3

import argparse
import json
import re
from datetime import datetime
from pathlib import Path


MANAGED_BLOCK = re.compile(
    r"<!-- setup-project:start -->.*?<!-- setup-project:end -->", re.DOTALL
)


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


def update_instructions(target: Path, block: str) -> str:
    if target.exists():
        original = target.read_text(encoding="utf-8")
        if MANAGED_BLOCK.search(original):
            updated = MANAGED_BLOCK.sub(block.strip(), original)
        else:
            updated = original.rstrip() + "\n\n" + block.strip() + "\n"
    else:
        updated = "# Agent instructions\n\n" + block.strip() + "\n"

    if target.exists() and target.read_text(encoding="utf-8") == updated:
        return "unchanged"

    target.write_text(updated, encoding="utf-8")
    return "updated" if target.exists() else "created"


def add_package_script(root: Path) -> tuple[str, str]:
    package_json = root / "package.json"
    if not package_json.exists():
        return "skipped", "package.json not found"

    try:
        data = json.loads(package_json.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as error:
        return "skipped", f"package.json could not be parsed: {error}"

    if not isinstance(data, dict):
        return "skipped", "package.json root is not an object"

    scripts = data.setdefault("scripts", {})
    if not isinstance(scripts, dict):
        return "skipped", "package.json scripts is not an object"

    command = "node scripts/validate-project.mjs"
    for name, existing in scripts.items():
        if existing == command:
            return "unchanged", f"{name} already configured"

    candidates = ["project:check", "project:validate", "validate:project"]
    name = next((candidate for candidate in candidates if candidate not in scripts), None)
    suffix = 2
    while name is None:
        candidate = f"project:check:{suffix}"
        if candidate not in scripts:
            name = candidate
        suffix += 1

    scripts[name] = command
    package_json.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    return "updated", f"added {name}"


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
    validator_target = root / "scripts" / "validate-project.mjs"
    results.append(
        (
            write_missing(
                validator_target, validator_source.read_text(encoding="utf-8")
            ),
            validator_target,
            "validator",
        )
    )

    instruction_block = (assets / "agent-instructions.md").read_text(
        encoding="utf-8"
    )
    for target in instruction_targets(root, args.instructions):
        existed = target.exists()
        status = update_instructions(target, instruction_block)
        if not existed and status == "updated":
            status = "created"
        results.append((status, target, "agent instructions"))

    for status, target, kind in results:
        print(f"{status:9} {kind:18} {target.relative_to(root)}")

    if not args.no_package_script:
        status, detail = add_package_script(root)
        print(f"{status:9} {'package script':18} {detail}")

    kept = [target for status, target, _ in results if status == "kept"]
    if kept:
        print("\nExisting files were preserved; review them for missing project conventions:")
        for target in kept:
            print(f"- {target.relative_to(root)}")

    print("\nRun: node scripts/validate-project.mjs")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
