import type { TaskFieldValues } from '../../utils/validateTask';
import type { Task } from '../../types';

export type TaskDialogProps = {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onExited: () => void;
  onDelete: (task: Task) => void;
  onSubmit: (values: TaskFieldValues) => Promise<void>;
};
