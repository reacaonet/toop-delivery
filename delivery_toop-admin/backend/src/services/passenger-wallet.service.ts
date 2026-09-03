import { PassengerWalletModel, IPassengerWalletTransaction } from '../models/PassengerWallet';
import { AppError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export class PassengerWalletService {
  async getOrCreate(holder: string) {
    if (!isObjectId(holder)) {
      throw new AppError('Id do passageiro inválido', 400);
    }
    let wallet = await PassengerWalletModel.findOne({ holder });
    if (!wallet) {
      wallet = await PassengerWalletModel.create({ holder, balance: 0, transactions: [] });
    }
    return wallet;
  }

  async credit(holder: string, amount: number, description: string, referenceId?: string, referenceType?: string) {
    if (!amount || amount <= 0) {
      throw new AppError('Valor deve ser maior que zero', 400);
    }

    const wallet = await this.getOrCreate(holder);
    const balanceAfter = wallet.balance + amount;

    const entry: IPassengerWalletTransaction = {
      type: 'credit',
      description,
      amount,
      balanceAfter,
      reference: referenceId ? new mongoose.Types.ObjectId(referenceId) : undefined,
      referenceType,
      createdAt: new Date(),
    };

    wallet.balance = balanceAfter;
    wallet.transactions.push(entry);
    await wallet.save();

    return { balance: balanceAfter, entry };
  }

  async getBalance(holder: string) {
    const wallet = await this.getOrCreate(holder);
    return {
      balance: wallet.balance,
      transactions: wallet.transactions.slice().reverse(),
    };
  }
}

export default new PassengerWalletService();
