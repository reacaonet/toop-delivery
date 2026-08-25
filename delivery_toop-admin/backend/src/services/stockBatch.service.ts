import StockBatchModel, { IStockBatch } from '../models/StockBatch';

export class StockBatchService {
  async create(data: Partial<IStockBatch>): Promise<IStockBatch> {
    return StockBatchModel.create(data);
  }

  async getById(id: string): Promise<IStockBatch | null> {
    return StockBatchModel.findById(id).populate('stockItem').populate('branch');
  }

  async listByBranch(branchId: string, stockItemId?: string): Promise<IStockBatch[]> {
    const query: any = { branch: branchId, status: 'active' };
    if (stockItemId) query.stockItem = stockItemId;
    return StockBatchModel.find(query)
      .populate('stockItem')
      .sort({ expiryDate: 1, entryDate: 1 });
  }

  async listByCompany(companyId: string): Promise<IStockBatch[]> {
    return StockBatchModel.find({ status: 'active' })
      .populate({
        path: 'stockItem',
        match: { company: companyId, active: true },
      })
      .populate('branch')
      .then((batches) => batches.filter((b) => b.stockItem));
  }

  async update(id: string, data: Partial<IStockBatch>): Promise<IStockBatch | null> {
    return StockBatchModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deductQuantity(id: string, quantity: number): Promise<IStockBatch | null> {
    const batch = await StockBatchModel.findById(id);
    if (!batch) return null;

    const newQty = batch.quantity - quantity;
    if (newQty <= 0) {
      batch.quantity = 0;
      batch.status = 'consumed';
    } else {
      batch.quantity = newQty;
    }
    return batch.save();
  }

  async getLowStock(companyId: string): Promise<any[]> {
    const StockItemModel = (await import('../models/StockItem')).default;
    const BranchModel = (await import('../models/Branch')).default;

    const items = await StockItemModel.find({ company: companyId, active: true });
    const branches = await BranchModel.find({ company: companyId, active: true });

    const alerts: any[] = [];

    for (const item of items) {
      for (const branch of branches) {
        const batches = await StockBatchModel.find({
          stockItem: item._id,
          branch: branch._id,
          status: 'active',
        });
        const totalQty = batches.reduce((sum, b) => sum + b.quantity, 0);

        if (totalQty < item.minimumStock) {
          alerts.push({
            stockItem: item,
            branch,
            currentQuantity: totalQty,
            minimumStock: item.minimumStock,
          });
        }
      }
    }

    return alerts;
  }
}

export default new StockBatchService();
