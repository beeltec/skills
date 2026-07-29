# Help

Load only when `help` is the first word after the explicit `develop` invocation. Help teaches the canonical interface; it never executes the described work.

## Workflow

1. Stop before resolving or inspecting a repository. Do not read project state, mutate files, or invoke another procedure.
2. Explain that `$develop <objective>` is sufficient and modes only disambiguate intent.
3. Show this compact canonical guide:

   ```text
   $develop <objective>                         Route and complete ordinary development work
   $develop help [goal]                         Show this guide or recommend one invocation
   $develop discuss <idea>                      Shape or decide without mutation
   $develop plan <outcome>                      Produce a durable implementation plan
   $develop setup                               Initialize or upgrade project governance
   $develop knowledge <accepted fact>           Publish accepted current knowledge
   $develop guidance <subjects>                 Adopt technology or standards guidance
   $develop implement <request or record>       Implement and verify
   $develop review <fixed-point>                 Review without fixing
   $develop release [patch|minor|major]          Prepare the requested release
   $develop product <PRD path or prose>          Run autonomously within PRD authority
   ```

4. State that deployment, remote publication, and material scope changes always require separate authority; `product` delegates only PRD-required decisions and destructive gates, never unrelated scope or remote publication.
5. Never teach legacy aliases. When a goal follows `help`, translate it into one exact canonical `$develop ...` invocation and stop without executing it.
6. Without a supplied goal, ask exactly one question: `What development outcome do you want help expressing?` On the answer, return one exact canonical invocation and stop without executing it.

## Done

Return the guide and either the navigator question or one exact invocation. Report no lane, repository state, or verification because none was inspected.
