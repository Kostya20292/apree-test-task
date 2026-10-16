import { isPriority, type Priority } from '../types';

export const TITLE_MAX_LENGTH = 200;
export const DESCRIPTION_MAX_LENGTH = 5000;

export type TaskFieldErrors = {
  title?: string;
  description?: string;
  priority?: string;
};

export type TaskFieldValues = {
  title: string;
  description: string;
  priority: Priority;
};

export const validateTitle = (title: string): { value: string } | { error: string } => {
  const value = title.trim();

  if (!value) {
    return { error: 'Укажите название' };
  }

  if (value.length > TITLE_MAX_LENGTH) {
    return { error: `Название не длиннее ${TITLE_MAX_LENGTH} символов` };
  }

  return { value };
};

export const validateDescription = (description: string): { value: string } | { error: string } => {
  const value = description.trim();

  if (!value) {
    return { error: 'Укажите описание' };
  }

  if (value.length > DESCRIPTION_MAX_LENGTH) {
    return {
      error: `Описание не длиннее ${DESCRIPTION_MAX_LENGTH} символов`,
    };
  }

  return { value };
};

export const normalizeTaskFields = (input: {
  title: string;
  description: string;
  priority: string;
}): { values: TaskFieldValues } | { errors: TaskFieldErrors } => {
  const title = validateTitle(input.title);
  const description = validateDescription(input.description);

  if ('error' in title || 'error' in description || !isPriority(input.priority)) {
    return {
      errors: {
        title: 'error' in title ? title.error : undefined,
        description: 'error' in description ? description.error : undefined,
        priority: isPriority(input.priority) ? undefined : 'Выберите приоритет',
      },
    };
  }

  return {
    values: {
      title: title.value,
      description: description.value,
      priority: input.priority,
    },
  };
};
