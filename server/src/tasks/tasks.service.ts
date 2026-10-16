import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Priority, Status, type Task } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from './dto/create-task.dto';

type CreateTaskInput = {
  title: unknown;
  description: unknown;
  priority?: unknown;
};

type UpdateTaskInput = {
  title?: unknown;
  description?: unknown;
  priority?: unknown;
  status?: unknown;
};

const isPriority = (value: unknown): value is Priority =>
  value === Priority.low || value === Priority.medium || value === Priority.high;

const isStatus = (value: unknown): value is Status =>
  value === Status.new || value === Status.in_progress || value === Status.done;

const parseTitle = (value: unknown) => {
  if (typeof value !== 'string') {
    throw new BadRequestException('Укажите название');
  }

  const title = value.trim();

  if (!title) {
    throw new BadRequestException('Укажите название');
  }

  if (title.length > TITLE_MAX_LENGTH) {
    throw new BadRequestException(`Название не длиннее ${TITLE_MAX_LENGTH} символов`);
  }

  return title;
};

const parseDescription = (value: unknown) => {
  if (typeof value !== 'string') {
    throw new BadRequestException('Укажите описание');
  }

  const description = value.trim();

  if (!description) {
    throw new BadRequestException('Укажите описание');
  }

  if (description.length > DESCRIPTION_MAX_LENGTH) {
    throw new BadRequestException(`Описание не длиннее ${DESCRIPTION_MAX_LENGTH} символов`);
  }

  return description;
};

const parsePriority = (value: unknown) => {
  if (!isPriority(value)) {
    throw new BadRequestException('Выберите приоритет');
  }

  return value;
};

const parseStatus = (value: unknown) => {
  if (!isStatus(value)) {
    throw new BadRequestException('Некорректный статус');
  }

  return value;
};

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Task[]> {
    return this.prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException('Задача не найдена');
    }

    return task;
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const title = parseTitle(input.title);
    const description = parseDescription(input.description);
    const priority = input.priority === undefined ? Priority.medium : parsePriority(input.priority);

    return this.prisma.task.create({
      data: {
        title,
        description,
        priority,
        status: Status.new,
      },
    });
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    const data: Prisma.TaskUpdateInput = {};

    if (input.title !== undefined) {
      data.title = parseTitle(input.title);
    }

    if (input.description !== undefined) {
      data.description = parseDescription(input.description);
    }

    if (input.priority !== undefined) {
      data.priority = parsePriority(input.priority);
    }

    if (input.status !== undefined) {
      data.status = parseStatus(input.status);
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Нет полей для изменения');
    }

    const existing = await this.prisma.task.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Задача не найдена');
    }

    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.task.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Задача не найдена');
    }

    await this.prisma.task.delete({ where: { id } });
  }
}
