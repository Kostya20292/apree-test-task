import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/main';
import { PrismaService } from '../src/prisma/prisma.service';

const missingId = '11111111-1111-4111-8111-111111111111';

describe('Tasks HTTP', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.task.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('не создаёт задачу с пустым названием', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/tasks')
      .send({ title: '   ', description: 'Описание', priority: 'low' })
      .expect(400);

    expect(response.body.message).toContain('Укажите название');
    await expect(prisma.task.count()).resolves.toBe(0);
  });

  it('создаёт задачу со статусом new', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/tasks')
      .send({
        title: '  Название  ',
        description: '  Описание  ',
        priority: 'high',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      title: 'Название',
      description: 'Описание',
      priority: 'high',
      status: 'new',
    });
  });

  it('при смене статуса оставляет название, описание и приоритет', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/tasks')
      .send({ title: 'Название', description: 'Описание', priority: 'high' })
      .expect(201);

    const updated = await request(app.getHttpServer())
      .patch(`/api/tasks/${created.body.id}`)
      .send({ status: 'in_progress' })
      .expect(200);

    expect(updated.body).toMatchObject({
      title: 'Название',
      description: 'Описание',
      priority: 'high',
      status: 'in_progress',
    });
  });

  it('при смене названия не меняет статус', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/tasks')
      .send({ title: 'Название', description: 'Описание', priority: 'high' })
      .expect(201);

    const updated = await request(app.getHttpServer())
      .patch(`/api/tasks/${created.body.id}`)
      .send({ title: 'Другое' })
      .expect(200);

    expect(updated.body).toMatchObject({
      title: 'Другое',
      description: 'Описание',
      priority: 'high',
      status: 'new',
    });
  });

  it('удаляет задачу, и следующий список её не содержит', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/tasks')
      .send({ title: 'Название', description: 'Описание', priority: 'medium' })
      .expect(201);

    await request(app.getHttpServer()).delete(`/api/tasks/${created.body.id}`).expect(204);

    const list = await request(app.getHttpServer()).get('/api/tasks').expect(200);

    expect(list.body).toEqual([]);
  });

  it('отдаёт пустой список', async () => {
    const response = await request(app.getHttpServer()).get('/api/tasks').expect(200);

    expect(response.body).toEqual([]);
  });

  it('возвращает 400 для идентификатора, который не UUID', async () => {
    await request(app.getHttpServer()).get('/api/tasks/not-a-uuid').expect(400);
  });

  it('возвращает 404 для неизвестного UUID', async () => {
    await request(app.getHttpServer()).get(`/api/tasks/${missingId}`).expect(404);
    await request(app.getHttpServer()).delete(`/api/tasks/${missingId}`).expect(404);
  });
});
