export const PRIORITIES = ["low", "medium", "high"] as const;

export type Priority = (typeof PRIORITIES)[number];

export const STATUSES = ["new", "in_progress", "done"] as const;

export type Status = (typeof STATUSES)[number];

export type PriorityFilterValue = "all" | Priority;

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskInput = {
  title: string;
  description: string;
  priority?: Priority;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

export const isPriority = (value: string): value is Priority =>
  PRIORITIES.some((priority) => priority === value);

export const isStatus = (value: string): value is Status =>
  STATUSES.some((status) => status === value);

export const isPriorityFilterValue = (
  value: string,
): value is PriorityFilterValue => value === "all" || isPriority(value);
