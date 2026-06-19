import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

// Payme JSON-RPC error codes
const PAYME_ERR = {
  ORDER_NOT_FOUND:   { code: -31050, message: { ru: 'Заказ не найден', uz: 'Buyurtma topilmadi', en: 'Order not found' } },
  ORDER_AMOUNT:      { code: -31051, message: { ru: 'Неверная сумма', uz: 'Noto\'g\'ri summa', en: 'Incorrect amount' } },
  ORDER_BAD_STATE:   { code: -31052, message: { ru: 'Заказ в неверном статусе', uz: 'Buyurtma xato holatda', en: 'Order in bad state' } },
  TXN_NOT_FOUND:     { code: -31001, message: { ru: 'Транзакция не найдена', uz: 'Tranzaksiya topilmadi', en: 'Transaction not found' } },
  CANT_CANCEL_DONE:  { code: -31007, message: { ru: 'Нельзя отменить выполненную транзакцию', uz: 'Bajarilgan tranzaksiyani bekor qilib bo\'lmaydi', en: 'Cannot cancel completed transaction' } },
  CANT_CANCEL_INPROGRESS: { code: -31008, message: { ru: 'Нельзя отменить транзакцию в процессе', uz: 'Jarayon davomidagi tranzaksiyani bekor qilib bo\'lmaydi', en: 'Cannot cancel in-progress transaction' } },
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly commission: number;
  private readonly testMode: boolean;
  private readonly merchantId: string;
  private readonly paymeKey: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.commission = Number(config.get('PLATFORM_COMMISSION_PERCENT') ?? 10);
    this.testMode = config.get('PAYME_TEST_MODE') === 'true';
    this.merchantId = config.get('PAYME_MERCHANT_ID') ?? '';
    this.paymeKey = config.get('PAYME_KEY') ?? '';
  }

  // ── Initiate payment ────────────────────────────────────────────────────────

  async initiate(customerId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        selectedExecutor: { include: { user: true } },
        bids: { where: { status: 'accepted' }, take: 1 },
      },
    });

    if (!task) throw new NotFoundException('Vazifa topilmadi');
    if (task.customerId !== customerId) throw new ForbiddenException();
    if (task.status !== 'executor_selected') {
      throw new BadRequestException('Usta hali tanlanmagan');
    }
    if (task.paymentMethod !== 'safe_deal') {
      throw new BadRequestException("Bu vazifa xavfsiz to'lov usulida emas");
    }

    const acceptedBid = task.bids[0];
    if (!acceptedBid) throw new BadRequestException('Qabul qilingan taklif topilmadi');

    const amountUzs = Number(acceptedBid.priceUzs);
    const commissionUzs = Math.round(amountUzs * this.commission / 100);
    const payeeUserId = task.selectedExecutor!.userId;

    // Idempotent — reuse existing pending payment if one exists
    let payment = await this.prisma.payment.findFirst({
      where: { taskId, payerId: customerId, status: 'pending' },
    });

    if (!payment) {
      payment = await this.prisma.payment.create({
        data: {
          taskId,
          payerId: customerId,
          payeeId: payeeUserId,
          amountUzs: BigInt(amountUzs),
          commissionUzs: BigInt(commissionUzs),
          paymentMethod: 'payme',
          status: 'pending',
        },
      });
    }

    const checkoutUrl = this.buildPaymeUrl(payment.id, amountUzs);
    return { paymentId: payment.id, checkoutUrl, amountUzs };
  }

  // ── Payme JSON-RPC webhook ───────────────────────────────────────────────────

  async handleWebhook(authHeader: string | undefined, body: any) {
    if (!this.verifyAuth(authHeader)) {
      return { id: body?.id ?? 0, error: { code: -32504, message: 'Unauthorized', data: 'auth' } };
    }

    const { id, method, params } = body;

    try {
      switch (method) {
        case 'CheckPerformTransaction': return { id, result: await this.checkPerform(params) };
        case 'CreateTransaction':       return { id, result: await this.createTxn(params) };
        case 'PerformTransaction':      return { id, result: await this.performTxn(params) };
        case 'CancelTransaction':       return { id, result: await this.cancelTxn(params) };
        case 'CheckTransaction':        return { id, result: await this.checkTxn(params) };
        case 'GetStatement':            return { id, result: await this.getStatement(params) };
        default:
          return { id, error: { code: -32300, message: 'Unknown method', data: method } };
      }
    } catch (e: any) {
      this.logger.error(`Payme webhook error (${method}): ${e.message}`);
      return { id, error: e.paymeError ?? { code: -32400, message: e.message } };
    }
  }

  private async checkPerform(params: any) {
    const payment = await this.findPaymentByParams(params);
    this.assertPending(payment);
    return { allow: true };
  }

  private async createTxn(params: any) {
    const { id: paymeId, time } = params;
    const payment = await this.findPaymentByParams(params);
    this.assertPending(payment);

    // If already has an external txn id from a prior CreateTransaction, return it
    if (payment.externalTransactionId) {
      return {
        create_time: payment.createdAt.getTime(),
        transaction: payment.externalTransactionId,
        state: 1,
      };
    }

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: { externalTransactionId: paymeId, status: 'held' },
    });

    return {
      create_time: time,
      transaction: paymeId,
      state: 1,
    };
  }

  private async performTxn(params: any) {
    const { id: paymeId } = params;
    const payment = await this.prisma.payment.findFirst({
      where: { externalTransactionId: paymeId },
    });

    if (!payment) throw this.paymeError(PAYME_ERR.TXN_NOT_FOUND);

    if (payment.status === 'released') {
      return { perform_time: payment.createdAt.getTime(), transaction: paymeId, state: 2 };
    }

    if (payment.status !== 'held') throw this.paymeError(PAYME_ERR.ORDER_BAD_STATE);

    const now = Date.now();

    if (payment.subscriptionId) {
      // Subscription payment
      await this.prisma.$transaction([
        this.prisma.payment.update({ where: { id: payment.id }, data: { status: 'released' } }),
        this.prisma.subscription.update({ where: { id: payment.subscriptionId }, data: { isActive: true } }),
      ]);
      this.logger.log(`Subscription payment ${payment.id} released — subscription ${payment.subscriptionId} activated`);
    } else if (payment.taskId) {
      // Task escrow payment
      await this.prisma.$transaction([
        this.prisma.payment.update({ where: { id: payment.id }, data: { status: 'released' } }),
        this.prisma.task.update({ where: { id: payment.taskId }, data: { status: 'in_progress' } }),
      ]);
      this.logger.log(`Payment ${payment.id} released — task ${payment.taskId} → in_progress`);
    } else {
      await this.prisma.payment.update({ where: { id: payment.id }, data: { status: 'released' } });
    }

    return { perform_time: now, transaction: paymeId, state: 2 };
  }

  private async cancelTxn(params: any) {
    const { id: paymeId, reason } = params;
    const payment = await this.prisma.payment.findFirst({
      where: { externalTransactionId: paymeId },
    });

    if (!payment) throw this.paymeError(PAYME_ERR.TXN_NOT_FOUND);
    if (payment.status === 'released') throw this.paymeError(PAYME_ERR.CANT_CANCEL_DONE);

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'refunded' },
    });

    return { cancel_time: Date.now(), transaction: paymeId, state: -1 };
  }

  private async checkTxn(params: any) {
    const { id: paymeId } = params;
    const payment = await this.prisma.payment.findFirst({
      where: { externalTransactionId: paymeId },
    });

    if (!payment) throw this.paymeError(PAYME_ERR.TXN_NOT_FOUND);

    const stateMap: Record<string, number> = {
      pending: 1, held: 1, released: 2, refunded: -1, disputed: -1,
    };

    return {
      create_time: payment.createdAt.getTime(),
      perform_time: payment.status === 'released' ? payment.createdAt.getTime() : 0,
      cancel_time: ['refunded', 'disputed'].includes(payment.status) ? payment.createdAt.getTime() : 0,
      transaction: paymeId,
      state: stateMap[payment.status] ?? 1,
      reason: null,
    };
  }

  private async getStatement(params: any) {
    const { from, to } = params;
    const payments = await this.prisma.payment.findMany({
      where: {
        paymentMethod: 'payme',
        externalTransactionId: { not: null },
        createdAt: { gte: new Date(from), lte: new Date(to) },
      },
    });

    return {
      transactions: payments.map((p) => ({
        id: p.externalTransactionId,
        time: p.createdAt.getTime(),
        amount: Number(p.amountUzs) * 100, // tiyn
        account: { payment_id: p.id },
        create_time: p.createdAt.getTime(),
        perform_time: p.status === 'released' ? p.createdAt.getTime() : 0,
        cancel_time: 0,
        transaction: p.externalTransactionId,
        state: p.status === 'released' ? 2 : 1,
        reason: null,
      })),
    };
  }

  // ── Task completion: release escrow ────────────────────────────────────────

  async getTaskPayment(taskId: string, userId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { taskId, OR: [{ payerId: userId }, { payeeId: userId }] },
      orderBy: { createdAt: 'desc' },
    });
    if (!payment) return null;
    return {
      id: payment.id,
      status: payment.status,
      amountUzs: Number(payment.amountUzs),
      commissionUzs: Number(payment.commissionUzs),
      createdAt: payment.createdAt,
    };
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private async findPaymentByParams(params: any) {
    const paymentId = params?.account?.payment_id ?? params?.account?.subscription_payment_id;
    if (!paymentId) throw this.paymeError(PAYME_ERR.ORDER_NOT_FOUND);

    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw this.paymeError(PAYME_ERR.ORDER_NOT_FOUND);

    // Payme sends amount in tiyn; our DB stores in so'm
    const expectedTiyn = Number(payment.amountUzs) * 100;
    if (params.amount && params.amount !== expectedTiyn) {
      throw this.paymeError(PAYME_ERR.ORDER_AMOUNT);
    }

    return payment;
  }

  private assertPending(payment: any) {
    if (!['pending', 'held'].includes(payment.status)) {
      throw this.paymeError(PAYME_ERR.ORDER_BAD_STATE);
    }
  }

  private verifyAuth(header: string | undefined): boolean {
    if (!header?.startsWith('Basic ')) return false;
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    // Format: "Paycom:{KEY}"
    const expected = `Paycom:${this.paymeKey}`;
    return decoded === expected;
  }

  private buildPaymeUrl(paymentId: string, amountUzs: number): string {
    const amountTiyn = amountUzs * 100;
    const params = `m=${this.merchantId};ac.payment_id=${paymentId};a=${amountTiyn}`;
    const encoded = Buffer.from(params).toString('base64');
    const base = this.testMode
      ? 'https://test.paycom.uz'
      : 'https://checkout.paycom.uz';
    return `${base}/${encoded}`;
  }

  private paymeError(err: { code: number; message: object }) {
    const e: any = new Error(JSON.stringify(err.message));
    e.paymeError = { code: err.code, message: err.message };
    return e;
  }
}
