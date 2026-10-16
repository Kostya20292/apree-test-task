import { Transform } from 'class-transformer';
import { IsIn, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { Priority, Status } from '../../generated/prisma/client';
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from './create-task.dto';

const PRIORITY_VALUES = [Priority.low, Priority.medium, Priority.high] as const;
const STATUS_VALUES = [Status.new, Status.in_progress, Status.done] as const;

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const isPresent = (_: unknown, value: unknown) => value !== undefined;

export class UpdateTaskDto {
  @ValidateIf(isPresent)
  @Transform(trimString)
  @IsString({ message: 'Укажите название' })
  @MinLength(1, { message: 'Укажите название' })
  @MaxLength(TITLE_MAX_LENGTH, {
    message: `Название не длиннее ${TITLE_MAX_LENGTH} символов`,
  })
  title?: string;

  @ValidateIf(isPresent)
  @Transform(trimString)
  @IsString({ message: 'Укажите описание' })
  @MinLength(1, { message: 'Укажите описание' })
  @MaxLength(DESCRIPTION_MAX_LENGTH, {
    message: `Описание не длиннее ${DESCRIPTION_MAX_LENGTH} символов`,
  })
  description?: string;

  @ValidateIf(isPresent)
  @IsIn(PRIORITY_VALUES, { message: 'Выберите приоритет' })
  priority?: (typeof PRIORITY_VALUES)[number];

  @ValidateIf(isPresent)
  @IsIn(STATUS_VALUES, { message: 'Некорректный статус' })
  status?: (typeof STATUS_VALUES)[number];
}
