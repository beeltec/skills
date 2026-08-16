import { createTask, toggleTask } from "./actions";
import { getTaskStore } from "@/lib/task-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function Home() {
  const tasks = getTaskStore().list();
  const openCount = tasks.filter((task) => !task.completed).length;

  return (
    <main>
      <section className="task-card" aria-labelledby="page-title">
        <header>
          <p className="eyebrow">Local task list</p>
          <h1 id="page-title">Small Steps</h1>
          <p className="summary">
            {tasks.length === 0
              ? "Add the first task."
              : `${openCount} of ${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} open.`}
          </p>
        </header>

        <form action={createTask} className="new-task">
          <label htmlFor="title">New task</label>
          <div className="input-row">
            <input
              id="title"
              name="title"
              type="text"
              minLength={1}
              maxLength={120}
              placeholder="Ship one useful change"
              required
            />
            <button type="submit">Add task</button>
          </div>
        </form>

        {tasks.length > 0 ? (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className={task.completed ? "completed" : undefined}>
                <form action={toggleTask}>
                  <input type="hidden" name="id" value={task.id} />
                  <button type="submit" className="toggle" aria-label={`Toggle ${task.title}`}>
                    <span aria-hidden="true">{task.completed ? "✓" : ""}</span>
                  </button>
                  <span>{task.title}</span>
                </form>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}
