"use server";

import { revalidatePath } from "next/cache";
import { getTaskStore } from "@/lib/task-store";

export async function createTask(formData: FormData): Promise<void> {
  const title = formData.get("title");
  if (typeof title !== "string") throw new Error("Task title is required.");

  getTaskStore().create(title);
  revalidatePath("/");
}

export async function toggleTask(formData: FormData): Promise<void> {
  const rawId = formData.get("id");
  if (typeof rawId !== "string") throw new Error("Task ID is required.");

  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Task ID is invalid.");

  getTaskStore().toggle(id);
  revalidatePath("/");
}
