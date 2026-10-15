import type { CreateTaskInput, Task, UpdateTaskInput } from "../types";
import {
  createMockTask,
  deleteMockTask,
  getMockTasks,
  updateMockTask,
} from "./mockTasksApi";

const useMock = import.meta.env.VITE_USE_MOCK !== "false";

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Не удалось выполнить действие";
};

const readResponseMessage = async (response: Response) => {
  try {
    const data: unknown = await response.json();

    if (typeof data !== "object" || data === null || !("message" in data)) {
      return "Не удалось выполнить запрос";
    }

    const { message } = data;

    if (typeof message === "string" && message.trim()) {
      return message;
    }

    if (Array.isArray(message)) {
      const text = message
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .join(". ");

      if (text) {
        return text;
      }
    }
  } catch {
    return "Не удалось выполнить запрос";
  }

  return "Не удалось выполнить запрос";
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(path, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new Error("Нет соединения с сервером");
  }

  if (!response.ok) {
    throw new Error(await readResponseMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
};

export const getTasks = () =>
  useMock ? getMockTasks() : request<Task[]>("/api/tasks");

export const createTask = (input: CreateTaskInput) =>
  useMock
    ? createMockTask(input)
    : request<Task>("/api/tasks", {
        method: "POST",
        body: JSON.stringify(input),
      });

export const updateTask = (id: string, input: UpdateTaskInput) =>
  useMock
    ? updateMockTask(id, input)
    : request<Task>(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      });

export const deleteTask = (id: string) =>
  useMock
    ? deleteMockTask(id)
    : request<void>(`/api/tasks/${id}`, { method: "DELETE" });
