/to-epic

Confirmed coordinated outcome from our discussion: input-validation hardening across the
library. Every exported function must reject invalid input with a typed error instead of
returning a wrong value. Two child items:

1. `slugify` throws a TypeError on an empty or whitespace-only input string; unit tested.
2. `clamp` throws a TypeError when any argument is NaN; unit tested.

Epic acceptance: both children done, README documents the error contract of every exported
function. Nothing else is in scope — no new functions, no API renames.

Proceed under your standing approval without asking me anything.
