import { WalletModel, WalletTransactionModel } from "../models/Wallet";
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

  async credit(
    driverId: string,
    amount: number,
    description: string,
    bookingId?: string
  ) {
    if (amount <= 0) {
      throw new AppError("Valor deve ser maior que zero", 400);
    }

    const wallet = await this.getOrCreateWallet(driverId);

    const session = await WalletModel.db.startSession();
    session.startTransaction();

    try {
      wallet.balance += amount;
      wallet.totalEarnings += amount;
      await wallet.save({ session });

      const transaction = await WalletTransactionModel.create(
        [
          {
            wallet: wallet._id,
            type: "credit",
            amount,
            description,
            booking: bookingId,
            status: "completed",
          },
        ],
        { session }
      );

      wallet.lastTransaction = transaction[0]._id;
      await wallet.save({ session });

      await session.commitTransaction();

      return { wallet, transaction: transaction[0] };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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

    const session = await WalletModel.db.startSession();
    session.startTransaction();

    try {
      wallet.balance -= amount;
      wallet.totalWithdrawals += amount;
      await wallet.save({ session });

      const transaction = await WalletTransactionModel.create(
        [
          {
            wallet: wallet._id,
            type: "debit",
            amount,
            description,
            booking: bookingId,
            status: "completed",
          },
        ],
        { session }
      );

      wallet.lastTransaction = transaction[0]._id;
      await wallet.save({ session });

      await session.commitTransaction();

      return { wallet, transaction: transaction[0] };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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

    const session = await WalletModel.db.startSession();
    session.startTransaction();

    try {
      wallet.balance -= amount;
      wallet.totalWithdrawals += amount;
      await wallet.save({ session });

      const transaction = await WalletTransactionModel.create(
        [
          {
            wallet: wallet._id,
            type: "debit",
            amount,
            description: "Saque solicitado",
            status: "pending",
          },
        ],
        { session }
      );

      wallet.lastTransaction = transaction[0]._id;
      await wallet.save({ session });

      await session.commitTransaction();

      return { wallet, transaction: transaction[0] };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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
}

export default new WalletService();
