/**
 * End-to-end: Customer + Executor full flow
 *
 * Covers the complete round-trip:
 * auth → create task → view feed → submit bid → accept bid
 * → complete task → leave review → view public executor profile
 *
 * Uses real Postgres + Redis (Docker containers must be running).
 * Tokens are minted directly with the dev JWT_SECRET so no OTP is needed.
 * Test data is cleaned up in afterAll.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

// Patch BigInt serialisation (mirrors main.ts)
(BigInt.prototype as unknown as Record<string, unknown>).toJSON = function () {
  return Number(this);
};

describe('Customer → Executor flow (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;

  // IDs captured across tests
  let customerId: string;
  let executorUserId: string;
  let executorProfileId: string;
  let categoryId: string;
  let taskId: string;
  let bidId: string;
  let reviewId: string;

  // Bearer tokens minted without OTP
  let customerToken: string;
  let executorToken: string;

  // ── Setup / teardown ──────────────────────────────────────────────

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    prisma = module.get<PrismaService>(PrismaService);
    jwt    = module.get<JwtService>(JwtService);

    // Pick the first active top-level (parent) category
    const cat = await prisma.category.findFirst({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: 'asc' },
    });
    if (!cat) throw new Error('No active category found in DB — run seed first');
    categoryId = cat.id;

    // Seed customer user
    const customer = await prisma.user.create({
      data: {
        phone: '+998907771111',
        fullName: 'E2E Customer',
        role: 'customer',
        isPhoneVerified: true,
        isActive: true,
      },
    });
    customerId    = customer.id;
    customerToken = jwt.sign({ sub: customer.id, role: 'customer' });

    // Seed executor user + profile + active subscription
    const executorUser = await prisma.user.create({
      data: {
        phone: '+998907772222',
        fullName: 'E2E Executor',
        role: 'executor',
        isPhoneVerified: true,
        isActive: true,
      },
    });
    executorUserId  = executorUser.id;
    executorToken   = jwt.sign({ sub: executorUser.id, role: 'executor' });

    const profile = await prisma.executorProfile.create({
      data: {
        userId: executorUser.id,
        bio:    'E2E test executor — professional plumber',
        city:   'Toshkent',
      },
    });
    executorProfileId = profile.id;

    // Give executor an active subscription in the test category
    await prisma.subscription.create({
      data: {
        executorId: profile.id,
        categoryId,
        planType:   'base_25',
        bidsTotal:  25,
        bidsUsed:   0,
        priceUzs:   BigInt(0),
        startsAt:   new Date(),
        expiresAt:  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive:   true,
      },
    });
  }, 30_000);

  afterAll(async () => {
    if (!prisma) { await app?.close(); return; }
    // Delete in reverse-dependency order
    if (reviewId)         await prisma.review.delete({ where: { id: reviewId } }).catch(() => {});
    if (bidId)            await prisma.bid.delete({ where: { id: bidId } }).catch(() => {});
    if (taskId)           await prisma.task.delete({ where: { id: taskId } }).catch(() => {});
    if (executorProfileId) {
      await prisma.subscription.deleteMany({ where: { executorId: executorProfileId } });
      await prisma.executorProfile.delete({ where: { id: executorProfileId } }).catch(() => {});
    }
    await prisma.user.deleteMany({
      where: { phone: { in: ['+998907771111', '+998907772222'] } },
    });
    await app.close();
  }, 15_000);

  // ── 1. Auth guard ─────────────────────────────────────────────────

  it('rejects unauthenticated requests with 401', () => {
    return request(app.getHttpServer())
      .get('/api/auth/me')
      .expect(401);
  });

  // ── 2. Customer: get profile ───────────────────────────────────────

  it('[customer] GET /auth/me → returns user profile', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.id).toBe(customerId);
    expect(res.body.role).toBe('customer');
    expect(res.body.fullName).toBe('E2E Customer');
  });

  // ── 3. Customer: post a task ──────────────────────────────────────

  it('[customer] POST /tasks → creates published task', async () => {
    const startAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2h from now

    const res = await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        categoryId,
        title:         'E2E santexnika ishlari',
        description:   'Kran almashtirilishi kerak',
        isRemote:      false,
        addressA:      'Toshkent, Chilonzor tumani',
        startAt,
        budgetUzs:     500000,
        paymentMethod: 'direct',
      })
      .expect(201);

    taskId = res.body.id;
    expect(taskId).toBeTruthy();
    expect(res.body.status).toBe('published');
    expect(res.body.title).toBe('E2E santexnika ishlari');
  });

  it('[customer] GET /tasks/my → includes the newly created task', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/tasks/my')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    const found = res.body.find((t: any) => t.id === taskId);
    expect(found).toBeDefined();
    expect(found.status).toBe('published');
  });

  it('[customer] GET /tasks/:id → returns full task detail', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.id).toBe(taskId);
    expect(res.body.title).toBe('E2E santexnika ishlari');
    expect(Number(res.body.budgetUzs)).toBe(500000);
  });

  // ── 4. Executor: browse profile & feed ────────────────────────────

  it('[executor] GET /auth/me → returns executor user', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${executorToken}`)
      .expect(200);

    expect(res.body.id).toBe(executorUserId);
    expect(res.body.role).toBe('executor');
  });

  it('[executor] GET /executor/me → returns executor profile', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/executor/me')
      .set('Authorization', `Bearer ${executorToken}`)
      .expect(200);

    expect(res.body.bio).toBe('E2E test executor — professional plumber');
    expect(res.body.city).toBe('Toshkent');
    expect(res.body.badge).toBe('registered');
  });

  it("[executor] GET /tasks/feed → shows the customer's task", async () => {
    const res = await request(app.getHttpServer())
      .get('/api/tasks/feed')
      .set('Authorization', `Bearer ${executorToken}`)
      .expect(200);

    expect(Array.isArray(res.body.tasks)).toBe(true);
    const found = res.body.tasks.find((t: any) => t.id === taskId);
    expect(found).toBeDefined();
    expect(found.status).toBe('published');
  });

  it('[executor] GET /tasks/feed?search= → filters by keyword', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/tasks/feed?search=santexnika')
      .set('Authorization', `Bearer ${executorToken}`)
      .expect(200);

    // Every returned task title/description should match
    expect(res.body.tasks.length).toBeGreaterThan(0);
    const found = res.body.tasks.find((t: any) => t.id === taskId);
    expect(found).toBeDefined();
  });

  it('[executor] GET /tasks/feed?sortBy=budget_high → returns budgets in descending order', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/tasks/feed?sortBy=budget_high')
      .set('Authorization', `Bearer ${executorToken}`)
      .expect(200);

    const budgets: number[] = res.body.tasks
      .map((t: any) => t.budgetUzs)
      .filter((b: number | null) => b !== null);

    for (let i = 1; i < budgets.length; i++) {
      expect(budgets[i]).toBeLessThanOrEqual(budgets[i - 1]);
    }
  });

  it('[executor] GET /executor/:userId/public → returns public profile', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/executor/${executorUserId}/public`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.userId).toBe(executorUserId);
    expect(res.body.fullName).toBe('E2E Executor');
    expect(res.body.bio).toBe('E2E test executor — professional plumber');
  });

  // ── 5. Executor: submit bid ───────────────────────────────────────

  it('[executor] POST /bids → submits a bid on the task', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/bids')
      .set('Authorization', `Bearer ${executorToken}`)
      .send({
        taskId,
        priceUzs: 450000,
        message:  'Men bu ishni 2 soatda bajarishim mumkin',
      })
      .expect(201);

    bidId = res.body.id;
    expect(bidId).toBeTruthy();
    expect(res.body.status).toBe('pending');
    expect(Number(res.body.priceUzs)).toBe(450000);
  });

  it('[executor] POST /bids again → rejects duplicate bid', async () => {
    await request(app.getHttpServer())
      .post('/api/bids')
      .set('Authorization', `Bearer ${executorToken}`)
      .send({ taskId, priceUzs: 400000 })
      .expect(400);
  });

  it('[executor] GET /bids/my → shows the submitted bid', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/bids/my')
      .set('Authorization', `Bearer ${executorToken}`)
      .expect(200);

    const found = res.body.find((b: any) => b.id === bidId);
    expect(found).toBeDefined();
    expect(found.task.id).toBe(taskId);
  });

  // ── 6. Customer: view bids & accept ──────────────────────────────

  it('[customer] GET /bids/task/:taskId → shows executor bid', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/bids/task/${taskId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    const found = res.body.find((b: any) => b.id === bidId);
    expect(found).toBeDefined();
    expect(found.status).toBe('pending');
    expect(Number(found.priceUzs)).toBe(450000);
  });

  it('[customer] PATCH /bids/:bidId/accept → marks bid accepted', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/bids/${bidId}/accept`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });

  it('[customer] task status is executor_selected after bid accept', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.status).toBe('executor_selected');
  });

  // ── 7. Customer: complete task ────────────────────────────────────

  it('[customer] PATCH /tasks/:id/complete → marks task completed', async () => {
    // Payment flow would normally transition executor_selected → in_progress.
    // In tests we bypass payment and set in_progress directly via Prisma.
    await prisma.task.update({ where: { id: taskId }, data: { status: 'in_progress' } });

    await request(app.getHttpServer())
      .patch(`/api/tasks/${taskId}/complete`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    const res = await request(app.getHttpServer())
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.status).toBe('completed');
  });

  it('[executor] completedTaskCount incremented after task completion', async () => {
    const profile = await prisma.executorProfile.findUnique({
      where: { id: executorProfileId },
    });
    expect(profile!.completedTaskCount).toBe(1);
  });

  // ── 8. Customer: leave review ─────────────────────────────────────

  it('[customer] POST /reviews → submits a 5-star review', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        taskId,
        rating: 5,
        text:   'Ajoyib ish! Vaqtida va sifatli bajardi.',
      })
      .expect(201);

    reviewId = res.body.id;
    expect(reviewId).toBeTruthy();
    expect(res.body.rating).toBe(5);
    expect(res.body.taskId).toBe(taskId);
  });

  it('[executor] GET /reviews/executor/:userId → shows the review', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/reviews/executor/${executorUserId}`)
      .set('Authorization', `Bearer ${executorToken}`)
      .expect(200);

    const found = (res.body.reviews ?? res.body).find((r: any) => r.id === reviewId);
    expect(found).toBeDefined();
    expect(found.rating).toBe(5);
  });

  // ── 9. Guard: executor cannot act as customer ──────────────────────

  it('[executor] cannot complete a task they do not own', async () => {
    // Task is already completed but let's verify the ownership guard generally
    await request(app.getHttpServer())
      .patch(`/api/tasks/${taskId}/complete`)
      .set('Authorization', `Bearer ${executorToken}`)
      .expect(403);
  });

  it('[customer] cannot post to executor-only feed', async () => {
    await request(app.getHttpServer())
      .get('/api/tasks/feed')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);
  });
});
