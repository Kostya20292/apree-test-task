import { sortTasksByCreatedAtDesc } from "../taskOrder";
import {
  isPriority,
  isStatus,
  type CreateTaskInput,
  type Task,
  type UpdateTaskInput,
} from "../types";
import { validateDescription, validateTitle } from "../validateTask";

const STORAGE_KEY = "apree-tasks";
const RESPONSE_DELAY_MS = 250;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const delay = () =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, RESPONSE_DELAY_MS);
  });

const isUuid = (value: string) => UUID_PATTERN.test(value);

const isTask = (value: unknown): value is Task => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const task = value as Record<string, unknown>;

  return (
    typeof task.id === "string" &&
    typeof task.title === "string" &&
    typeof task.description === "string" &&
    typeof task.priority === "string" &&
    isPriority(task.priority) &&
    typeof task.status === "string" &&
    isStatus(task.status) &&
    typeof task.createdAt === "string" &&
    typeof task.updatedAt === "string"
  );
};

const readTasks = () => {
  let raw: string | null;

  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    throw new Error("Не удалось прочитать сохранённые задачи");
  }

  if (!raw) {
    return [];
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Не удалось прочитать сохранённые задачи");
  }

  if (!Array.isArray(parsed) || !parsed.every(isTask)) {
    throw new Error("Не удалось прочитать сохранённые задачи");
  }

  return sortTasksByCreatedAtDesc(parsed);
};

const writeTasks = (tasks: Task[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    throw new Error("Не удалось сохранить задачи в браузере");
  }
};

const requireTask = (id: string) => {
  if (!isUuid(id)) {
    throw new Error("Некорректный идентификатор");
  }

  const tasks = readTasks();
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    throw new Error("Задача не найдена");
  }

  return { tasks, task };
};

export const getMockTasks = async () => {
  await delay();
  return readTasks();
};

export const createMockTask = async (input: CreateTaskInput) => {
  await delay();

  const title = validateTitle(input.title);
  const description = validateDescription(input.description);
  const priority = input.priority ?? "medium";

  if ("error" in title) {
    throw new Error(title.error);
  }

  if ("error" in description) {
    throw new Error(description.error);
  }

  if (!isPriority(priority)) {
    throw new Error("Выберите приоритет");
  }

  const now = new Date().toISOString();
  const task: Task = {
    id: crypto.randomUUID(),
    title: title.value,
    description: description.value,
    priority,
    status: "new",
    createdAt: now,
    updatedAt: now,
  };

  writeTasks(sortTasksByCreatedAtDesc([task, ...readTasks()]));
  return task;
};

export const updateMockTask = async (id: string, patch: UpdateTaskInput) => {
  await delay();

  const keys = Object.keys(patch);

  if (keys.length === 0) {
    throw new Error("Нет полей для изменения");
  }

  const { tasks, task } = requireTask(id);
  const next: Task = { ...task };

  if (patch.title !== undefined) {
    const title = validateTitle(patch.title);

    if ("error" in title) {
      throw new Error(title.error);
    }

    next.title = title.value;
  }

  if (patch.description !== undefined) {
    const description = validateDescription(patch.description);

    if ("error" in description) {
      throw new Error(description.error);
    }

    next.description = description.value;
  }

  if (patch.priority !== undefined) {
    if (!isPriority(patch.priority)) {
      throw new Error("Выберите приоритет");
    }

    next.priority = patch.priority;
  }

  if (patch.status !== undefined) {
    if (!isStatus(patch.status)) {
      throw new Error("Некорректный статус");
    }

    next.status = patch.status;
  }

  next.updatedAt = new Date().toISOString();

  writeTasks(
    tasks.map((item) => (item.id === id ? next : item)),
  );

  return next;
};

export const deleteMockTask = async (id: string) => {
  await delay();
  const { tasks } = requireTask(id);
  writeTasks(tasks.filter((item) => item.id !== id));
};
