import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { createTask, deleteTask, getErrorMessage, getTasks, updateTask } from '../../api/tasksApi';
import { sortTasksByCreatedAtDesc } from '../../taskOrder';
import type { PriorityFilterValue, Status, Task } from '../../types';
import type { TaskFieldValues } from '../../validateTask';
import { COLUMNS, COLUMN_LABEL, isStatus } from '../columns';
import { Column } from '../Column/Column';
import { DeleteDialog } from '../DeleteDialog/DeleteDialog';
import { PriorityFilter } from '../PriorityFilter/PriorityFilter';
import { TaskCardPreview } from '../TaskCard/TaskCard';
import { TaskDialog } from '../TaskDialog/TaskDialog';
import type { DeleteDialogSession, TaskDialogSession } from './types';

const collisionDetection: CollisionDetection = (args) => {
  const byPointer = pointerWithin(args);

  if (byPointer.length > 0) {
    return byPointer;
  }

  return rectIntersection(args);
};

const closeTaskDialog = (current: TaskDialogSession | null): TaskDialogSession | null =>
  current ? { ...current, open: false } : current;

const closeDeleteDialog = (current: DeleteDialogSession | null): DeleteDialogSession | null =>
  current ? { ...current, open: false } : current;

export const Board = () => {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PriorityFilterValue>('all');
  const [taskSession, setTaskSession] = useState<TaskDialogSession | null>(null);
  const [deleteSession, setDeleteSession] = useState<DeleteDialogSession | null>(null);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const moveLockRef = useRef(false);
  const ignoreClickRef = useRef(false);
  const loadIdRef = useRef(0);

  const loadTasks = useCallback(async () => {
    const loadId = ++loadIdRef.current;

    try {
      const next = await getTasks();

      if (loadId !== loadIdRef.current) {
        return;
      }

      setTasks(next);
      hasLoadedRef.current = true;
      setLoadError(null);
    } catch (error) {
      if (loadId !== loadIdRef.current) {
        return;
      }

      const message = getErrorMessage(error);

      if (hasLoadedRef.current) {
        setActionError(message);
      } else {
        setLoadError(message);
      }
    } finally {
      if (loadId === loadIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- список приходит с API при открытии страницы
    void loadTasks();
  }, [loadTasks]);

  const handleRetry = () => {
    setActionError(null);
    setLoadError(null);

    if (!hasLoadedRef.current) {
      setIsLoading(true);
    }

    void loadTasks();
  };

  const handleCreate = () => {
    setTaskSession({ open: true, task: null });
  };

  const handleOpenTask = (task: Task) => {
    if (ignoreClickRef.current) {
      return;
    }

    setTaskSession({ open: true, task });
  };

  const handleCloseTask = () => {
    setTaskSession(closeTaskDialog);
  };

  const handleTaskDialogExited = () => {
    setTaskSession((current) => (current?.open ? current : null));
  };

  const handleCloseDelete = () => {
    setDeleteSession(closeDeleteDialog);
  };

  const handleDeleteDialogExited = () => {
    setDeleteSession((current) => (current?.open ? current : null));
  };

  const refreshTasks = async () => {
    try {
      const next = await getTasks();
      setTasks(next);
      hasLoadedRef.current = true;
      setLoadError(null);
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const handleSubmitTask = async (values: TaskFieldValues) => {
    const currentTask = taskSession?.task ?? null;

    if (currentTask) {
      const saved = await updateTask(currentTask.id, values);
      setTasks(
        (current) => current?.map((item) => (item.id === saved.id ? saved : item)) ?? [saved],
      );
    } else {
      const saved = await createTask(values);
      setTasks((current) => sortTasksByCreatedAtDesc([saved, ...(current ?? [])]));
    }

    setTaskSession(closeTaskDialog);
    await refreshTasks();
  };

  const handleConfirmDelete = async () => {
    if (!deleteSession) {
      return;
    }

    const taskId = deleteSession.task.id;
    await deleteTask(taskId);
    setTasks((current) => current?.filter((item) => item.id !== taskId) ?? []);
    setDeleteSession(closeDeleteDialog);
    setTaskSession(closeTaskDialog);
    await refreshTasks();
  };

  const moveTask = async (task: Task, status: Status, optimistic: boolean) => {
    if (moveLockRef.current || task.status === status) {
      return;
    }

    moveLockRef.current = true;
    setPendingTaskId(task.id);
    setActionError(null);

    if (optimistic) {
      setTasks(
        (current) =>
          current?.map((item) => (item.id === task.id ? { ...item, status } : item)) ?? current,
      );
    }

    let moved = false;

    try {
      await updateTask(task.id, { status });
      moved = true;
      const next = await getTasks();
      setTasks(next);
      hasLoadedRef.current = true;
      setLoadError(null);
    } catch (error) {
      if (optimistic && !moved) {
        setTasks(
          (current) =>
            current?.map((item) =>
              item.id === task.id ? { ...item, status: task.status } : item,
            ) ?? current,
        );
      }

      setActionError(getErrorMessage(error));
    } finally {
      moveLockRef.current = false;
      setPendingTaskId(null);
    }
  };

  const handleMove = (task: Task, status: Status) => {
    void moveTask(task, status, false);
  };

  const releaseClick = () => {
    window.setTimeout(() => {
      ignoreClickRef.current = false;
    }, 0);
  };

  const handleDragStart = (event: DragStartEvent) => {
    ignoreClickRef.current = true;
    setActiveDragId(String(event.active.id));
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
    releaseClick();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    releaseClick();

    const { active, over } = event;

    if (!over) {
      return;
    }

    const nextStatus = String(over.id);

    if (!isStatus(nextStatus)) {
      return;
    }

    const task = tasks?.find((item) => item.id === String(active.id));

    if (!task) {
      return;
    }

    void moveTask(task, nextStatus, true);
  };

  const visibleTasks = (tasks ?? []).filter((task) =>
    filter === 'all' ? true : task.priority === filter,
  );
  const activeTask = tasks?.find((task) => task.id === activeDragId) ?? null;
  const isDragEnabled = !isCompact && pendingTaskId === null;

  const announcements: Announcements = {
    onDragStart({ active }) {
      const task = tasks?.find((item) => item.id === active.id);
      return task ? `Задача «${task.title}» взята` : 'Задача взята';
    },
    onDragOver({ over }) {
      if (!over || !isStatus(String(over.id))) {
        return 'Вне колонки';
      }

      return `Над колонкой «${COLUMN_LABEL[String(over.id) as Status]}»`;
    },
    onDragEnd({ active, over }) {
      const nextStatus = over ? String(over.id) : '';
      const task = tasks?.find((item) => item.id === active.id);

      if (!isStatus(nextStatus) || !task || task.status === nextStatus) {
        return 'Перенос отменён';
      }

      return `Задача перенесена в колонку «${COLUMN_LABEL[nextStatus]}»`;
    },
    onDragCancel() {
      return 'Перенос отменён';
    },
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="header"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 2, md: 3 },
          pt: { xs: 2, md: 3 },
          pb: 1,
        }}
      >
        <Typography component="h1" variant="h1">
          Доска задач
        </Typography>
        {tasks ? (
          <Button
            type="button"
            variant="contained"
            onClick={handleCreate}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Создать задачу
          </Button>
        ) : null}
      </Box>
      <Box
        component="main"
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 2, md: 3 },
          pb: 3,
        }}
      >
        {isLoading && tasks === null ? (
          <Box
            role="status"
            aria-live="polite"
            sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6 }}
          >
            <CircularProgress aria-hidden />
            <Typography component="p">Загрузка задач</Typography>
          </Box>
        ) : null}

        {loadError && tasks === null ? (
          <Alert
            severity="error"
            sx={{ mt: 2 }}
            action={
              <Button type="button" color="inherit" onClick={handleRetry}>
                Повторить
              </Button>
            }
          >
            {loadError}
          </Alert>
        ) : null}

        {tasks ? (
          <>
            <PriorityFilter value={filter} onChange={setFilter} />
            {actionError ? (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                onClose={() => {
                  setActionError(null);
                }}
                action={
                  <Button type="button" color="inherit" onClick={handleRetry}>
                    Повторить
                  </Button>
                }
              >
                {actionError}
              </Alert>
            ) : null}
            {tasks.length === 0 ? (
              <Box role="status" sx={{ py: 2 }}>
                <Typography component="p" sx={{ mb: 1.5 }}>
                  Пока нет задач.
                </Typography>
                <Button type="button" variant="contained" onClick={handleCreate}>
                  Создать задачу
                </Button>
              </Box>
            ) : null}
            {tasks.length > 0 && visibleTasks.length === 0 ? (
              <Typography component="p" role="status" sx={{ py: 2 }}>
                Нет задач с таким приоритетом
              </Typography>
            ) : null}
            <DndContext
              sensors={sensors}
              collisionDetection={collisionDetection}
              accessibility={{
                announcements,
                screenReaderInstructions: {
                  draggable:
                    'Чтобы перенести задачу на ширине компьютера, потяните карточку в другую колонку. На узкой ширине используйте кнопки.',
                },
              }}
              onDragStart={handleDragStart}
              onDragCancel={handleDragCancel}
              onDragEnd={handleDragEnd}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'minmax(0, 1fr)',
                    md: 'repeat(3, minmax(0, 1fr))',
                  },
                  gap: 2,
                  alignItems: 'stretch',
                }}
              >
                {COLUMNS.map((column) => (
                  <Column
                    key={column.status}
                    status={column.status}
                    label={column.label}
                    tasks={sortTasksByCreatedAtDesc(
                      visibleTasks.filter((task) => task.status === column.status),
                    )}
                    isDragEnabled={isDragEnabled}
                    isMoveDisabled={pendingTaskId !== null}
                    onOpen={handleOpenTask}
                    onMove={handleMove}
                  />
                ))}
              </Box>
              <DragOverlay dropAnimation={null}>
                {activeTask ? <TaskCardPreview task={activeTask} /> : null}
              </DragOverlay>
            </DndContext>
          </>
        ) : null}
      </Box>
      {taskSession ? (
        <TaskDialog
          open={taskSession.open}
          task={taskSession.task}
          onClose={handleCloseTask}
          onExited={handleTaskDialogExited}
          onDelete={(task) => {
            setDeleteSession({ open: true, task });
          }}
          onSubmit={handleSubmitTask}
        />
      ) : null}
      {deleteSession ? (
        <DeleteDialog
          open={deleteSession.open}
          task={deleteSession.task}
          onClose={handleCloseDelete}
          onExited={handleDeleteDialogExited}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </Box>
  );
};
