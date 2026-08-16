# Skill routing evals

`skill-routing.json` is a host-neutral prompt fixture. The repository test checks
its schema and coverage. It does not call a model or prove routing quality.

Run every prompt through each supported agent host after changing a skill name,
description, or boundary. Record the selected skill, unexpected extra skills,
and result. Use at least three realistic cases for each materially changed
skill. Keep forward tests isolated from real repositories and external systems.

The deterministic CLI tests cover workflow behavior. Subagent forward tests
cover instruction clarity. Both are required for a substantial workflow change.
