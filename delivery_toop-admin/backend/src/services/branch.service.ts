import BranchModel, { IBranch } from '../models/Branch';

export class BranchService {
  async create(data: Partial<IBranch>): Promise<IBranch> {
    return BranchModel.create(data);
  }

  async getById(id: string): Promise<IBranch | null> {
    return BranchModel.findById(id);
  }

  async listByCompany(companyId: string): Promise<IBranch[]> {
    return BranchModel.find({ company: companyId, active: true }).sort({ name: 1 });
  }

  async update(id: string, data: Partial<IBranch>): Promise<IBranch | null> {
    return BranchModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<IBranch | null> {
    return BranchModel.findByIdAndUpdate(id, { active: false }, { new: true });
  }
}

export default new BranchService();
