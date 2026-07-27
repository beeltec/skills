#!/usr/bin/env bash
# Recreates the changed-branch fixture at run time (cwd = prepared project):
# WORK-001 claimed in-progress with a live expiry, and a conventional feature branch
# carrying the percent() implementation the record asks for.
set -euo pipefail

record="$(ls docs/backlog/standalone/WORK-001-*.md | head -1)"
expiry="$(date -u -v+2d '+%Y-%m-%dT%H:%M:%SZ' 2> /dev/null || date -u -d '+2 days' '+%Y-%m-%dT%H:%M:%SZ')"

python3 - "$record" "$expiry" << 'PY'
import re
import sys

path, expiry = sys.argv[1], sys.argv[2]
with open(path) as handle:
    content = handle.read()
content = re.sub(r'^status: .*$', 'status: in-progress', content, count=1, flags=re.M)
content = re.sub(r'^claim: .*$', 'claim: testbed-fixture', content, count=1, flags=re.M)
content = re.sub(r'^claim_expires: .*$', f'claim_expires: {expiry}', content, count=1, flags=re.M)
with open(path, 'w') as handle:
    handle.write(content)
PY

git switch -qc feat/work-001-percent

cat > src/percent.ts << 'TS'
export const percent = (value: number, total: number): number => {
  if (total === 0) {
    throw new RangeError('total must not be 0');
  }
  return Math.round((value / total) * 1000) / 10;
};
TS

cat > tests/percent.test.ts << 'TS'
import { expect, test } from 'vitest';
import { percent } from '../src/percent.js';

test('percent computes a rounded share', () => {
  expect(percent(1, 3)).toBe(33.3);
});

test('percent rejects a zero total', () => {
  expect(() => percent(1, 0)).toThrow(RangeError);
});
TS

printf "export { percent } from './percent.js';\n" >> src/index.ts

git add -A
git -c user.email=testbed@local -c user.name=Testbed \
  commit -qm 'feat: add percent() share calculation (WORK-001)'
