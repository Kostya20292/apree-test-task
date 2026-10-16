import { Transform } from 'class-transformer';
import { IsIn, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { Priority } from '../../generated/prisma/client';

export const TITLE_MAX_LENGTH = 200;
export const DESCRIPTION_MAX_LENGTH = 5000;

const PRIORITY_VALUES = [Priority.low, Priority.medium, Priority.high] as const;

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateTaskDto {
  @Transform(trimString)
  @IsString({ message: 'Укажите название' })
  @MinLength(1, { message: 'Укажите название' })
  @MaxLength(TITLE_MAX_LENGTH, {
    message: `Название не длиннее ${TITLE_MAX_LENGTH} символов`,
  })
  title!: string;

  @Transform(trimString)
  @IsString({ message: 'Укажите описание' })
  @MinLength(1, { message: 'Укажите описание' })
  @MaxLength(DESCRIPTION_MAX_LENGTH, {
    message: `Описание не длиннее ${DESCRIPTION_MAX_LENGTH} символов`,
  })
  description!: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsIn(PRIORITY_VALUES, { message: 'Выберите приоритет' })
  priority?: (typeof PRIORITY_VALUES)[number];
}
