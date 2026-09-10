import mongoose from "mongoose";
import { WalletModel, WalletTransactionModel } from "../models/Wallet";
import { DriverModel } from "../models/Driver";
import { DeliverymanModel } from "../models/Deliveryman";
import { AppError } from "../middleware/errorHandler";

interface PaginationQuery {
  page?: string;
  limit?: string;
}

interface PaginatedResult {
  data: any[];
  total: number;
  page: number;
  pages: number;
}

const TRANSACTION_UNSUPPORTED_CODE = 20; // IllegalOperation: "Transaction numbers are only allowed on a replica set member or mongos"

export class WalletService {
  async getOrCreateWallet(driverId: string) {
    let wallet = await WalletModel.findOne({ driver: driverId });
    if (!wallet) {
      wallet = await WalletModel.create({ driver: driverId, balance: 0 });
    }
    return wallet;
  }

  async getBalance(driverId: string) {
    const wallet = await this.getOrCreateWallet(driverId);
    return {
      balance: wallet.balance,
      totalEarnings: wallet.totalEarnings,
      totalWithdrawals: wallet.totalWithdrawals,
    };
  }

  /**
   * Tenta executar dentro de uma transação Mongo; se o banco for standalone
   * (dev e produção usam `mongo:5.0 --auth` sem replica set), faz fallback
   * para escrita atômica (sem transação).
   */
  private async withTransaction<T>(
    fn: (session: mongoose.ClientSession | undefined) => Promise<T>
  ): Promise<T> {
    const session = await WalletModel.db.startSession();
    try {
      session.startTransaction();
      const result = await fn(session);
      await session.commitTransaction();
      return result;
    } catch (error: any) {
      try {
        await session.abortTransaction();
      } catch {
        /* transação nunca iniciou de fato */
      }
      if (error?.code === TRANSACTION_UNSUPPORTED_CODE) {
        return fn(undefined);
      }
      throw error;
    } finally {
      session.endSession();
    }
  }

  private async applyMovement(
    driverId: string,
    amount: number,
    type: "credit" | "debit",
    description: string,
    status: "completed" | "pending",
    bookingId?: string,
    session?: mongoose.ClientSession
  ) {
    const opts = session ? { session } : {};
    const inc: Record<string, number> =
      type === "credit"
        ? { balance: amount, totalEarnings: amount }
        : { balance: -amount, totalWithdrawals: amount };

    const wallet = await WalletModel.findOneAndUpdate(
      { driver: driverId },
      { $inc: inc },
      { new: true, ...opts }
    );
    if (!wallet) {
      throw new AppError("Carteira não encontrada", 404);
    }

    const transaction = await WalletTransactionModel.create(
      [
        {
          wallet: wallet._id,
          type,
          amount,
          description,
          booking: bookingId,
          status,
        },
      ],
      opts as any
    );

    await WalletModel.findByIdAndUpdate(
      wallet._id,
      { lastTransaction: transaction[0]._id },
      opts as any
    );

    return { wallet, transaction: transaction[0] };
  }

  async credit(
    driverId: string,
    amount: number,
    description: string,
    bookingId?: string
  ) {
    if (amount <= 0) {
      throw new AppError("Valor deve ser maior que zero", 400);
    }

    await this.getOrCreateWallet(driverId);

    return this.withTransaction((session) =>
      this.applyMovement(driverId, amount, "credit", description, "completed", bookingId, session)
    );
  }

  async debit(
    driverId: string,
    amount: number,
    description: string,
    bookingId?: string
  ) {
    if (amount <= 0) {
      throw new AppError("Valor deve ser maior que zero", 400);
    }

    const wallet = await this.getOrCreateWallet(driverId);

    if (wallet.balance < amount) {
      throw new AppError("Saldo insuficiente", 400);
    }

    return this.withTransaction((session) =>
      this.applyMovement(driverId, amount, "debit", description, "completed", bookingId, session)
    );
  }

  async requestWithdrawal(
    driverId: string,
    amount: number,
    pixKey: string,
    pixType: string
  ) {
    if (amount <= 0) {
      throw new AppError("Valor deve ser maior que zero", 400);
    }

    if (!pixKey || !pixType) {
      throw new AppError("Chave PIX e tipo sao obrigatorios", 400);
    }

    const wallet = await this.getOrCreateWallet(driverId);

    if (wallet.balance < amount) {
      throw new AppError("Saldo insuficiente", 400);
    }

    wallet.pixKey = pixKey;
    wallet.pixType = pixType as any;
    await wallet.save();

    return this.withTransaction((session) =>
      this.applyMovement(driverId, amount, "debit", "Saque solicitado", "pending", undefined, session)
    );
  }

  async getTransactions(
    driverId: string,
    query: PaginationQuery
  ): Promise<PaginatedResult> {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const wallet = await this.getOrCreateWallet(driverId);

    const [data, total] = await Promise.all([
      WalletTransactionModel.find({ wallet: wallet._id })
        .populate("booking", "bookingNumber")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      WalletTransactionModel.countDocuments({ wallet: wallet._id }),
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Withdrawal requests (Solicitações de saque)                        */
  /* ------------------------------------------------------------------ */

  private async enrichWithdrawals(transactions: any[]) {
    const ids = [
      ...new Set(transactions.map((t) => t.wallet?.driver?.toString()).filter(Boolean)),
    ];
    if (ids.length === 0) return transactions;

    const [drivers, deliverymen] = await Promise.all([
      DriverModel.find({ _id: { $in: ids } }).lean(),
      DeliverymanModel.find({ _id: { $in: ids } }).lean(),
    ]);

    const map = new Map<string, any>();
    drivers.forEach((d: any) => map.set(d._id.toString(), { model: "Driver", name: d.name, email: d.email }));
    deliverymen.forEach((d: any) => map.set(d._id.toString(), { model: "Deliveryman", name: d.name, email: d.email }));

    return transactions.map((t) => ({
      ...t.toObject ? t.toObject() : t,
      driver: map.get(t.wallet?.driver?.toString()) || null,
    }));
  }

  async listWithdrawals(query: any): Promise<PaginatedResult> {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const filter: any = { type: "debit" };
    if (query.status && query.status !== "all") {
      filter.status = query.status;
    }

    const [data, total] = await Promise.all([
      WalletTransactionModel.find(filter)
        .populate({ path: "wallet", select: "driver pixKey pixType balance" })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      WalletTransactionModel.countDocuments(filter),
    ]);

    return {
      data: await this.enrichWithdrawals(data),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async approveWithdrawal(transactionId: string) {
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      throw new AppError("Solicitação de saque não encontrada ou já processada", 404);
    }

    const transaction = await WalletTransactionModel.findOneAndUpdate(
      { _id: transactionId, type: "debit", status: "pending" },
      { $set: { status: "completed" } },
      { new: true }
    );

    if (!transaction) {
      throw new AppError("Solicitação de saque não encontrada ou já processada", 404);
    }

    return transaction;
  }

  async rejectWithdrawal(transactionId: string) {
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      throw new AppError("Solicitação de saque não encontrada ou já processada", 404);
    }

    const transaction = await WalletTransactionModel.findOne({
      _id: transactionId,
      type: "debit",
      status: "pending",
    });

    if (!transaction) {
      throw new AppError("Solicitação de saque não encontrada ou já processada", 404);
    }

    const wallet = await WalletModel.findById(transaction.wallet);
    if (!wallet) {
      throw new AppError("Carteira não encontrada", 404);
    }

    await this.withTransaction(async (session) => {
      const opts: any = session ? { session } : {};

      const updated = await WalletModel.findOneAndUpdate(
        { _id: wallet._id },
        { $inc: { balance: transaction.amount, totalWithdrawals: -transaction.amount } },
        { new: true, ...opts }
      );
      if (!updated) throw new AppError("Carteira não encontrada", 404);

      const refund = await WalletTransactionModel.create(
        [
          {
            wallet: wallet._id,
            type: "credit",
            amount: transaction.amount,
            description: "Estorno de saque rejeitado",
            status: "completed",
          },
        ],
        opts
      );

      await WalletModel.findByIdAndUpdate(wallet._id, { lastTransaction: refund[0]._id }, opts);

      await WalletTransactionModel.findByIdAndUpdate(
        transaction._id,
        { $set: { status: "failed" } },
        opts
      );
    });

    return WalletTransactionModel.findOne({ _id: transaction._id });
  }
}

export default new WalletService();
