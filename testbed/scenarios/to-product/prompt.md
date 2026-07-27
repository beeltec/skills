/to-product

PRD — percentage support for seed-metrics:

The library needs one new capability. Users can compute a percentage share:
`percent(value: number, total: number): number` returns value's share of total as a
percentage rounded to one decimal place, and a total of 0 throws a RangeError. The function
is exported from `src/index.ts`, unit tested (rounding and zero-total error), and listed in
the README's function list. Nothing else changes: no new dependencies, no API renames, no
other functions.

Run the whole delivery flow unattended to accepted primary-branch state.
