import StockMovementModel, { IStockMovement } from '../models/StockMovement';
import StockBatchModel from '../models/StockBatch';

export class StockMovementService {
  async create(data: Partial<IStockMovement>): Promise<IStockMovement> {
    if (!data.totalCost && data.unitCost && data.quantity) {
      data.totalCost = data.unitCost * data.quantity;
    }
    return StockMovementModel.create(data);
  }

  async getById(id: string): Promise<IStockMovement | null> {
    return StockMovementModel.findById(id)
      .populate('stockItem')
      .populate('branch')
      .populate('batch')
      .populate('order')
      .populate('user', 'name email');
  }

  async listByBranch(
    branchId: string,
    filters?: { type?: string; stockItemId?: string; startDate?: string; endDate?: string }
  ): Promise<IStockMovement[]> {
    const query: any = { branch: branchId };
    if (filters?.type) query.type = filters.type;
    if (filters?.stockItemId) query.stockItem = filters.stockItemId;
    if (filters?.startDate || filters?.endDate) {
      query.movementDate = {};
      if (filters.startDate) query.movementDate.$gte = new Date(filters.startDate);
      if (filters.endDate) query.movementDate.$lte = new Date(filters.endDate);
    }
    return StockMovementModel.find(query)
      .populate('stockItem')
      .populate('batch')
      .populate('user', 'name email')
      .sort({ movementDate: -1 });
  }

  async listByCompany(
    companyId: string,
    filters?: { type?: string; startDate?: string; endDate?: string }
  ): Promise<IStockMovement[]> {
    const BranchModel = (await import('../models/Branch')).default;
    const branchIds = (await BranchModel.find({ company: companyId })).map((b) => b._id);

    const query: any = { branch: { $in: branchIds } };
    if (filters?.type) query.type = filters.type;
    if (filters?.startDate || filters?.endDate) {
      query.movementDate = {};
      if (filters.startDate) query.movementDate.$gte = new Date(filters.startDate);
      if (filters.endDate) query.movementDate.$lte = new Date(filters.endDate);
    }
    return StockMovementModel.find(query)
      .populate('stockItem')
      .populate('branch')
      .populate('batch')
      .populate('user', 'name email')
      .sort({ movementDate: -1 })
      .limit(200);
  }

  async registerEntry(data: {
    stockItem: string;
    branch: string;
    quantity: number;
    unitCost: number;
    batchNumber: string;
    supplier?: string;
    expiryDate?: Date;
    user: string;
    reason?: string;
    notes?: string;
  }): Promise<{ movement: IStockMovement; batch: any }> {
    const batch = await StockBatchModel.create({
      stockItem: data.stockItem,
      branch: data.branch,
      quantity: data.quantity,
      initialQuantity: data.quantity,
      unitCost: data.unitCost,
      batchNumber: data.batchNumber,
      supplier: data.supplier,
      expiryDate: data.expiryDate,
      entryDate: new Date(),
      status: 'active',
    });

    const movement = await this.create({
      type: 'entry',
      stockItem: data.stockItem as any,
      branch: data.branch as any,
      batch: batch._id,
      quantity: data.quantity,
      unitCost: data.unitCost,
      totalCost: data.unitCost * data.quantity,
      user: data.user as any,
      reason: data.reason || 'Entrada de estoque',
      movementDate: new Date(),
      notes: data.notes,
    });

    return { movement, batch };
  }

  async registerExit(data: {
    stockItem: string;
    branch: string;
    quantity: number;
    user: string;
    orderId?: string;
    reason?: string;
    notes?: string;
  }): Promise<IStockMovement[]> {
    const batches = await StockBatchModel.find({
      stockItem: data.stockItem,
      branch: data.branch,
      status: 'active',
      quantity: { $gt: 0 },
    }).sort({ expiryDate: 1, entryDate: 1 });

    let remaining = data.quantity;
    const movements: IStockMovement[] = [];

    for (const batch of batches) {
      if (remaining <= 0) break;

      const deduct = Math.min(batch.quantity, remaining);
      batch.quantity -= deduct;
      if (batch.quantity <= 0) {
        batch.status = 'consumed';
      }
      await batch.save();

      const movement = await this.create({
        type: 'exit',
        stockItem: data.stockItem as any,
        branch: data.branch as any,
        batch: batch._id,
        quantity: deduct,
        unitCost: batch.unitCost,
        totalCost: batch.unitCost * deduct,
        order: data.orderId as any,
        user: data.user as any,
        reason: data.reason || 'Saída de estoque',
        movementDate: new Date(),
        notes: data.notes,
      });
      movements.push(movement);

      remaining -= deduct;
    }

    if (remaining > 0) {
      const movement = await this.create({
        type: 'exit',
        stockItem: data.stockItem as any,
        branch: data.branch as any,
        quantity: data.quantity - remaining,
        user: data.user as any,
        reason: data.reason || 'Saída de estoque (estoque insuficiente)',
        movementDate: new Date(),
        notes: `Quantidade solicitada: ${data.quantity}, disponível: ${data.quantity - remaining}`,
      });
      movements.push(movement);
    }

    return movements;
  }

  async getSummary(branchId: string): Promise<any[]> {
    const StockItemModel = (await import('../models/StockItem')).default;
    const items = await StockItemModel.find({ active: true });
    const summary: any[] = [];

    for (const item of items) {
      const batches = await StockBatchModel.find({
        stockItem: item._id,
        branch: branchId,
        status: 'active',
      });
      const totalQty = batches.reduce((sum, b) => sum + b.quantity, 0);
      const totalValue = batches.reduce((sum, b) => sum + b.quantity * b.unitCost, 0);

      summary.push({
        stockItem: item,
        totalQuantity: totalQty,
        totalValue,
        batchesCount: batches.length,
        belowMinimum: totalQty < item.minimumStock,
      });
    }

    return summary;
  }
}

export default new StockMovementService();
