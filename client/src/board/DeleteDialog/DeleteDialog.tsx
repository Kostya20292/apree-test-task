import { useId, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { getErrorMessage } from '../../api/tasksApi';
import type { DeleteDialogProps } from './types';

export const DeleteDialog = ({ open, task, onClose, onExited, onConfirm }: DeleteDialogProps) => {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const [isDeleting, setIsDeleting] = useState(false);
  const isDeletingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const handleClose = () => {
    if (isDeletingRef.current) {
      return;
    }

    onClose();
  };

  const handleConfirm = async () => {
    if (isDeletingRef.current) {
      return;
    }

    isDeletingRef.current = true;
    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm();
    } catch (confirmError) {
      setError(getErrorMessage(confirmError));
      isDeletingRef.current = false;
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      fullScreen={isCompact}
      role="alertdialog"
      onClose={handleClose}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      slotProps={{ transition: { onExited } }}
    >
      <DialogTitle id={titleId}>Удалить задачу?</DialogTitle>
      <DialogContent>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        <DialogContentText id={descriptionId}>
          Задача «{task.title}» будет удалена без восстановления.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button type="button" autoFocus onClick={handleClose} disabled={isDeleting}>
          Отмена
        </Button>
        <Button
          type="button"
          color="error"
          variant="contained"
          onClick={() => {
            void handleConfirm();
          }}
          disabled={isDeleting}
          aria-busy={isDeleting}
          aria-label={`Удалить задачу «${task.title}»`}
        >
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  );
};
