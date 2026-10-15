import type { Status, Task } from '../../types';

export type TaskPriorityProps = {
  task: Task;
};

export type TaskCardPreviewProps = {
  task: Task;
};

export type TaskCardProps = {
  task: Task;
  isDragEnabled: boolean;
  isMoveDisabled: boolean;
  onOpen: (task: Task) => void;
  onMove: (task: Task, status: Status) => void;
};
