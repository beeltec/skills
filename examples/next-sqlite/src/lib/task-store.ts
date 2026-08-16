import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

interface TaskRow {
  id: number;
  title: string;
  completed: 0 | 1;
  created_at: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseTaskRow(value: unknown): TaskRow {
  if (
    !isRecord(value) ||
    typeof value.id !== "number" ||
    typeof value.title !== "string" ||
    (value.completed !== 0 && value.completed !== 1) ||
    typeof value.created_at !== "string"
  ) {
    throw new Error("SQLite returned an invalid task row.");
  }

  return {
    id: value.id,
    title: value.title,
    completed: value.completed,
    created_at: value.created_at,
  };
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed === 1,
    createdAt: row.created_at,
  };
}

function normalizeTitle(title: string): string {
  const normalized = title.trim();
  if (!normalized) throw new Error("Task title cannot be empty.");
  if (normalized.length > 120) throw new Error("Task title cannot exceed 120 characters.");
  return normalized;
}

export class TaskStore {
  readonly #database: DatabaseSync;

  constructor(databasePath: string) {
    if (databasePath !== ":memory:") mkdirSync(dirname(databasePath), { recursive: true });
    this.#database = new DatabaseSync(databasePath);
    this.#database.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 120),
        completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) STRICT;
    `);
  }

  list(): Task[] {
    const rows = this.#database
      .prepare("SELECT id, title, completed, created_at FROM tasks ORDER BY id DESC")
      .all();
    return rows.map((row) => toTask(parseTaskRow(row)));
  }

  create(title: string): Task {
    const result = this.#database
      .prepare("INSERT INTO tasks (title) VALUES (?)")
      .run(normalizeTitle(title));
    return this.get(Number(result.lastInsertRowid));
  }

  toggle(id: number): Task {
    if (!Number.isSafeInteger(id) || id < 1) throw new Error("Task ID is invalid.");
    const result = this.#database
      .prepare("UPDATE tasks SET completed = CASE completed WHEN 0 THEN 1 ELSE 0 END WHERE id = ?")
      .run(id);
    if (Number(result.changes) !== 1) throw new Error(`Task ${id} does not exist.`);
    return this.get(id);
  }

  close(): void {
    this.#database.close();
  }

  private get(id: number): Task {
    const row = this.#database
      .prepare("SELECT id, title, completed, created_at FROM tasks WHERE id = ?")
      .get(id);
    if (row === undefined) throw new Error(`Task ${id} does not exist.`);
    return toTask(parseTaskRow(row));
  }
}

const globalStore = globalThis as typeof globalThis & { taskStore?: TaskStore };

export function getTaskStore(): TaskStore {
  if (!globalStore.taskStore) {
    const databasePath = process.env.TASK_DATABASE_PATH ?? join(process.cwd(), "data", "tasks.db");
    globalStore.taskStore = new TaskStore(databasePath);
  }
  return globalStore.taskStore;
}
