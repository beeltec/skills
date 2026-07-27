/to-backlog

Confirmed conclusions from our discussion, one standalone work item:

Add a `percent` function to the library. Outcome: the library exports
`percent(value: number, total: number): number` returning value's share of total as a
percentage rounded to one decimal place; a total of 0 throws a RangeError. Acceptance:
exported from `src/index.ts`, covered by unit tests for the rounding and the zero-total
error, and listed in the README's function list. Standalone (`parent: none`), no
relationships, rank it first.

Proceed under your standing approval without asking me anything; if a required step cannot
run, record why on the record rather than skipping silently.
