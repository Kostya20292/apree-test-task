import type { Task } from '../../types';

export type DeleteDialogProps = {
  open: boolean;
  task: Task;
  onClose: () => void;
  onExited: () => void;
  onConfirm: () => Promise<void>;
};
