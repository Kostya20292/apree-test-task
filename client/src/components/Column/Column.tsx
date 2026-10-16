import { useDroppable } from '@dnd-kit/core';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ColumnProps } from './types';
import { TaskCard } from '../TaskCard/TaskCard';

export const Column = ({
  status,
  label,
  tasks,
  isDragEnabled,
  isMoveDisabled,
  onOpen,
  onMove,
}: ColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    disabled: !isDragEnabled,
  });

  return (
    <Box
      component="section"
      ref={setNodeRef}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        minWidth: 0,
        minHeight: 220,
        p: 1.5,
        borderRadius: 2,
        bgcolor: isOver ? 'rgba(29, 78, 137, 0.08)' : '#e7edf4',
        border: '1px solid',
        borderColor: isOver ? 'primary.main' : 'transparent',
      }}
    >
      <Typography component="h2" variant="h2">
        {label}
      </Typography>
      {tasks.length === 0 ? (
        <Typography component="p" variant="body2" color="text.secondary">
          Нет задач
        </Typography>
      ) : (
        <Box
          component="ul"
          role="list"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            m: 0,
            p: 0,
            listStyle: 'none',
          }}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isDragEnabled={isDragEnabled}
              isMoveDisabled={isMoveDisabled}
              onOpen={onOpen}
              onMove={onMove}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};
