import assert from "node:assert/strict";
import test from "node:test";
import { TaskStore } from "./task-store";

test("creates, lists, and toggles tasks", () => {
  const store = new TaskStore(":memory:");

  try {
    const created = store.create("  Verify the workflow  ");
    assert.equal(created.title, "Verify the workflow");
    assert.equal(created.completed, false);
    assert.deepEqual(store.list(), [created]);

    const completed = store.toggle(created.id);
    assert.equal(completed.completed, true);
    assert.deepEqual(store.list(), [completed]);
  } finally {
    store.close();
  }
});

test("rejects invalid titles and unknown task IDs", () => {
  const store = new TaskStore(":memory:");

  try {
    assert.throws(() => store.create("   "), /cannot be empty/);
    assert.throws(() => store.create("x".repeat(121)), /cannot exceed 120/);
    assert.throws(() => store.toggle(42), /does not exist/);
  } finally {
    store.close();
  }
});
