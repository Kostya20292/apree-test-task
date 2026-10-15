import type { Task } from "./types";

export const compareTasksByCreatedAtDesc = (left: Task, right: Task) =>
  right.createdAt.localeCompare(left.createdAt) ||
  right.id.localeCompare(left.id);

export const sortTasksByCreatedAtDesc = (tasks: Task[]) =>
  [...tasks].sort(compareTasksByCreatedAtDesc);
