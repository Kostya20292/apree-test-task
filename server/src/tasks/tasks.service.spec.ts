import { BadRequestException, NotFoundException } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { PrismaService } from "../prisma/prisma.service";

const id = "11111111-1111-4111-8111-111111111111";

const createPrismaMock = () => ({
  task: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

describe("TasksService", () => {
  const prisma = createPrismaMock();
  const service = new TasksService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("не записывает задачу без названия, без описания или с неизвестным приоритетом", async () => {
    await expect(
      service.create({
        title: "   ",
        description: "Описание",
        priority: "low",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.create({
        title: "Название",
        description: "   ",
        priority: "low",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.create({
        title: "Название",
        description: "Описание",
        priority: "urgent",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.task.create).not.toHaveBeenCalled();
  });

  it("сохраняет новую задачу со статусом new", async () => {
    const created = {
      id,
      title: "Купить молоко",
      description: "Два литра",
      priority: "medium",
      status: "new",
    };

    prisma.task.create.mockResolvedValue(created);

    await expect(
      service.create({
        title: "  Купить молоко  ",
        description: "  Два литра  ",
      }),
    ).resolves.toBe(created);

    expect(prisma.task.create).toHaveBeenCalledWith({
      data: {
        title: "Купить молоко",
        description: "Два литра",
        priority: "medium",
        status: "new",
      },
    });
  });

  it("при смене статуса не передаёт остальные поля", async () => {
    prisma.task.findUnique.mockResolvedValue({ id, status: "new" });
    prisma.task.update.mockResolvedValue({ id, status: "in_progress" });

    await service.update(id, { status: "in_progress" });

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id },
      data: { status: "in_progress" },
    });
  });

  it("обновляет только переданные поля", async () => {
    prisma.task.findUnique.mockResolvedValue({ id });
    prisma.task.update.mockResolvedValue({ id });

    await service.update(id, {
      title: "  Новое название  ",
      priority: "low",
    });

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id },
      data: {
        title: "Новое название",
        priority: "low",
      },
    });
  });

  it("отклоняет обновление без полей", async () => {
    await expect(service.update(id, {})).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.task.findUnique).not.toHaveBeenCalled();
    expect(prisma.task.update).not.toHaveBeenCalled();
  });

  it("возвращает 404 при удалении отсутствующей задачи", async () => {
    prisma.task.findUnique.mockResolvedValue(null);

    await expect(service.remove(id)).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.task.delete).not.toHaveBeenCalled();
  });

  it("возвращает пустой список, если задач нет", async () => {
    prisma.task.findMany.mockResolvedValue([]);

    await expect(service.findAll()).resolves.toEqual([]);
    expect(prisma.task.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
    });
  });
});
