# Smell baseline

A fixed set of Fowler code smells (_Refactoring_, ch.3) that the Standards axis carries on top of documented rules, applying even when the repository documents nothing.

Two binding rules:

- **A documented repo standard always overrides** — suppress a smell that standard endorses.
- **Every smell is a labelled judgement-call heuristic** ("possible Feature Envy"), never a hard violation. Skip anything tooling already enforces.

Report each one by name, quoting the hunk:

- **Mysterious Name** — name doesn't reveal purpose → rename; if no honest name comes, the design's murky.
- **Duplicated Code** — same logic shape in multiple hunks/files → extract and share.
- **Feature Envy** — method uses another object's data more than its own → move it to that data.
- **Data Clumps** — the same fields/params travel together → bundle into one type.
- **Primitive Obsession** — primitive standing in for a domain concept → give it a small type.
- **Repeated Switches** — same `switch`/`if`-cascade on the same type recurs → polymorphism or one shared map.
- **Shotgun Surgery** — one logical change scattered across many files → gather into one module.
- **Divergent Change** — one module edited for unrelated reasons → split per reason.
- **Speculative Generality** — abstraction for needs the spec doesn't have → delete/inline until a real need shows.
- **Message Chains** — long `a.b().c().d()` navigation → hide behind one method on the first object.
- **Middle Man** — mostly delegates onward → cut it, call the target directly.
- **Refused Bequest** — implementer ignores most of what it inherits → composition over inheritance.
