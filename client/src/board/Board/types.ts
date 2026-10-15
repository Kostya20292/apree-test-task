import type { Task } from '../../types';

export type TaskDialogSession = {
  open: boolean;
  task: Task | null;
};

export type DeleteDialogSession = {
  open: boolean;
  task: Task;
};
