import type { Status } from './types';

export const COLUMNS: { status: Status; label: string }[] = [
  { status: 'new', label: 'Новая' },
  { status: 'in_progress', label: 'В работе' },
  { status: 'done', label: 'Готово' },
];

export const COLUMN_LABEL: Record<Status, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  done: 'Готово',
};

export const STATUS_TRANSITIONS: Record<Status, { status: Status; label: string }[]> = {
  new: [{ status: 'in_progress', label: 'В работе' }],
  in_progress: [
    { status: 'new', label: 'В «Новая»' },
    { status: 'done', label: 'В «Готово»' },
  ],
  done: [{ status: 'in_progress', label: 'В работу' }],
};
