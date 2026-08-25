import StockItemModel, { IStockItem } from '../models/StockItem';

export class StockItemService {
  async create(data: Partial<IStockItem>): Promise<IStockItem> {
    return StockItemModel.create(data);
  }

  async getById(id: string): Promise<IStockItem | null> {
    return StockItemModel.findById(id);
  }

  async listByCompany(companyId: string, search?: string): Promise<IStockItem[]> {
    const query: any = { company: companyId, active: true };
    if (search) {
      query.$text = { $search: search };
    }
    return StockItemModel.find(query).sort({ name: 1 });
  }

  async update(id: string, data: Partial<IStockItem>): Promise<IStockItem | null> {
    return StockItemModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<IStockItem | null> {
    return StockItemModel.findByIdAndUpdate(id, { active: false }, { new: true });
  }
}

export default new StockItemService();
