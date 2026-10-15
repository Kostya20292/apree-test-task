import type { MouseEvent } from 'react';
import { useDraggable } from '@dnd-kit/core';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { COLUMN_LABEL, STATUS_TRANSITIONS } from '../columns';
import { PRIORITY_LABEL } from '../../types';
import type { TaskCardPreviewProps, TaskCardProps, TaskPriorityProps } from './types';

const PRIORITY_CHIP_COLOR = {
  low: 'default',
  medium: 'warning',
  high: 'error',
} as const;

const handleStopEvent = (event: { stopPropagation: () => void }) => {
  event.stopPropagation();
};

const TaskPriority = ({ task }: TaskPriorityProps) => (
  <Chip
    size="small"
    label={PRIORITY_LABEL[task.priority]}
    color={PRIORITY_CHIP_COLOR[task.priority]}
    variant={task.priority === 'low' ? 'outlined' : 'filled'}
    sx={{ mt: 1, alignSelf: 'flex-start' }}
  />
);

export const TaskCardPreview = ({ task }: TaskCardPreviewProps) => (
  <Box
    sx={{
      width: 'min(320px, calc(100vw - 32px))',
      p: 1.5,
      borderRadius: 2,
      bgcolor: 'background.paper',
      boxShadow: 6,
      cursor: 'grabbing',
    }}
  >
    <Typography component="p" variant="h3" sx={{ overflowWrap: 'anywhere' }}>
      {task.title}
    </Typography>
    <TaskPriority task={task} />
  </Box>
);

export const TaskCard = ({
  task,
  isDragEnabled,
  isMoveDisabled,
  onOpen,
  onMove,
}: TaskCardProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    disabled: !isDragEnabled,
    attributes: {
      role: 'group',
      roleDescription: 'карточка задачи',
      tabIndex: -1,
    },
  });

  const handleOpen = () => {
    onOpen(task);
  };

  const handleTitleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    handleOpen();
  };

  const handleEditClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    handleOpen();
  };

  const handleSurfaceClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target;

    if (!(target instanceof Element) || target.closest('button')) {
      return;
    }

    handleOpen();
  };

  return (
    <Box component="li" role="listitem" sx={{ listStyle: 'none', minWidth: 0 }}>
      <Box
        component="article"
        ref={setNodeRef}
        onClick={handleSurfaceClick}
        {...(isDragEnabled ? listeners : undefined)}
        {...(isDragEnabled ? attributes : undefined)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          opacity: isDragging ? 0.45 : 1,
          touchAction: isDragEnabled ? 'none' : 'auto',
          cursor: isDragEnabled ? 'grab' : 'pointer',
        }}
      >
        <Box sx={{ position: 'relative', py: 1.5, pl: 1.5, pr: 6.5, minWidth: 0 }}>
          <IconButton
            type="button"
            aria-label={`Редактировать задачу «${task.title}»`}
            onPointerDown={handleStopEvent}
            onClick={handleEditClick}
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 40,
              height: 40,
              color: 'text.secondary',
            }}
          >
            <Box
              component="svg"
              viewBox="0 0 24 24"
              aria-hidden
              focusable="false"
              sx={{ width: 20, height: 20, display: 'block' }}
            >
              <path
                fill="currentColor"
                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
              />
            </Box>
          </IconButton>
          <Typography component="h3" variant="h3" sx={{ overflowWrap: 'anywhere' }}>
            <Box
              component="button"
              type="button"
              onClick={handleTitleClick}
              sx={{
                display: 'inline',
                p: 0,
                border: 0,
                background: 'transparent',
                color: 'inherit',
                font: 'inherit',
                textAlign: 'left',
                cursor: 'inherit',
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: 2,
                },
              }}
            >
              {task.title}
            </Box>
          </Typography>
          <TaskPriority task={task} />
        </Box>
        <Box
          role="group"
          aria-label={`Перенос задачи «${task.title}»`}
          onPointerDown={handleStopEvent}
          onClick={handleStopEvent}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            px: 1.5,
            pb: 1.5,
          }}
        >
          {STATUS_TRANSITIONS[task.status].map((transition) => (
            <Button
              key={transition.status}
              type="button"
              variant="outlined"
              onClick={() => {
                onMove(task, transition.status);
              }}
              disabled={isMoveDisabled}
              aria-label={`Перенести задачу «${task.title}» в колонку «${COLUMN_LABEL[transition.status]}»`}
            >
              {transition.label}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
