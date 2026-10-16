import type { Status, Task } from '../../types';

export type ColumnProps = {
  status: Status;
  label: string;
  tasks: Task[];
  isDragEnabled: boolean;
  isMoveDisabled: boolean;
  onOpen: (task: Task) => void;
  onMove: (task: Task, status: Status) => void;
};
