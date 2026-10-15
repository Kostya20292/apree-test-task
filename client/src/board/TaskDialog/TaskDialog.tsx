import { useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { getErrorMessage } from '../../api/tasksApi';
import { PRIORITIES, PRIORITY_LABEL, isPriority, type Priority } from '../../types';
import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  normalizeTaskFields,
  type TaskFieldErrors,
} from '../../validateTask';
import type { TaskDialogProps } from './types';

export const TaskDialog = ({
  open,
  task,
  onClose,
  onExited,
  onDelete,
  onSubmit,
}: TaskDialogProps) => {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const titleId = useId();
  const formId = useId();
  const priorityLabelId = useId();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium');
  const [showErrors, setShowErrors] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);

  const validation = showErrors ? normalizeTaskFields({ title, description, priority }) : null;
  const errors: TaskFieldErrors = validation && 'errors' in validation ? validation.errors : {};

  const handleClose = () => {
    if (isSavingRef.current) {
      return;
    }

    onClose();
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  };

  const handlePriorityChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isPriority(event.target.value)) {
      return;
    }

    setPriority(event.target.value);
  };

  const handleDelete = () => {
    if (!task || isSavingRef.current) {
      return;
    }

    onDelete(task);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSavingRef.current) {
      return;
    }

    setShowErrors(true);
    setSubmitError(null);

    const result = normalizeTaskFields({ title, description, priority });

    if ('errors' in result) {
      if (result.errors.title) {
        titleInputRef.current?.focus();
      } else if (result.errors.description) {
        descriptionInputRef.current?.focus();
      }

      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);

    try {
      await onSubmit(result.values);
    } catch (submitFailure) {
      setSubmitError(getErrorMessage(submitFailure));
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      fullScreen={isCompact}
      fullWidth
      maxWidth="sm"
      onClose={handleClose}
      aria-labelledby={titleId}
      slotProps={{ transition: { onExited } }}
    >
      <DialogTitle id={titleId}>{task ? 'Задача' : 'Новая задача'}</DialogTitle>
      <DialogContent>
        {submitError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        ) : null}
        <Box
          component="form"
          id={formId}
          noValidate
          autoComplete="off"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}
        >
          <TextField
            label="Название"
            name="title"
            value={title}
            onChange={handleTitleChange}
            required
            fullWidth
            autoFocus
            inputRef={titleInputRef}
            error={Boolean(errors.title)}
            helperText={errors.title ?? `От 1 до ${TITLE_MAX_LENGTH} символов`}
            slotProps={{
              htmlInput: { maxLength: TITLE_MAX_LENGTH },
            }}
          />
          <TextField
            label="Описание"
            name="description"
            value={description}
            onChange={handleDescriptionChange}
            required
            fullWidth
            multiline
            minRows={4}
            inputRef={descriptionInputRef}
            error={Boolean(errors.description)}
            helperText={errors.description ?? `От 1 до ${DESCRIPTION_MAX_LENGTH} символов`}
            slotProps={{
              htmlInput: { maxLength: DESCRIPTION_MAX_LENGTH },
            }}
          />
          <FormControl
            component="fieldset"
            error={Boolean(errors.priority)}
            sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}
          >
            <FormLabel id={priorityLabelId} component="legend" required>
              Приоритет
            </FormLabel>
            <RadioGroup
              row
              aria-labelledby={priorityLabelId}
              name="priority"
              value={priority}
              onChange={handlePriorityChange}
              sx={{ flexWrap: 'wrap' }}
            >
              {PRIORITIES.map((item) => (
                <FormControlLabel
                  key={item}
                  value={item}
                  control={<Radio />}
                  label={PRIORITY_LABEL[item]}
                />
              ))}
            </RadioGroup>
            {errors.priority ? <FormHelperText>{errors.priority}</FormHelperText> : null}
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2, gap: 1 }}>
        <Box>
          {task ? (
            <Button
              type="button"
              color="error"
              onClick={handleDelete}
              disabled={isSaving}
              aria-label={`Удалить задачу «${task.title}»`}
            >
              Удалить
            </Button>
          ) : null}
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button type="button" onClick={handleClose} disabled={isSaving}>
            Отмена
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="contained"
            disabled={isSaving}
            aria-busy={isSaving}
          >
            Сохранить
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
