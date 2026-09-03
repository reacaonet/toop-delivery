import mongoose from 'mongoose';
import { AlertProductModel } from '../models/AlertProduct';
import { ProductModel } from '../models/Product';
import { AppError } from '../middleware/errorHandler';

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && mongoose.isValidObjectId(id);
}

export class AlertProductService {
  async list(customer?: string) {
    const filter: any = { active: true };
    if (customer) filter.customer = customer;
    return AlertProductModel.find(filter).sort({ followingAt: -1 }).lean();
  }

  async create(data: { company?: string; customer?: string; product?: string }) {
    const { company, customer, product } = data;

    if (!company || !isValidId(company)) throw new AppError('Informe uma empresa válida', 400);
    if (!customer || !isValidId(customer)) throw new AppError('Informe um usuário válido', 400);
    if (!product || !isValidId(product)) throw new AppError('Informe um produto válido', 400);

    const productResponse = await ProductModel.findById(product).lean();
    if (!productResponse) throw new AppError('Informe um produto válido', 400);

    let alertResponse: any = await AlertProductModel.findOne({ customer, product, company })
      .sort({ followingAt: -1 })
      .lean();

    if (!alertResponse || alertResponse.active === false) {
      let priceClick = productResponse.price;
      if (productResponse.promoPrice && productResponse.promoPrice > 0) {
        priceClick = productResponse.promoPrice;
      }

      alertResponse = await AlertProductModel.create({
        company,
        customer,
        product,
        priceClick,
      });
    }

    return alertResponse;
  }

  async update(idAlert: string) {
    if (!idAlert || !isValidId(idAlert)) throw new AppError('Informe um alerta válido', 400);

    const alertResponse = await AlertProductModel.findByIdAndUpdate(
      idAlert,
      { unfollowedAt: new Date(), active: false },
      { new: true }
    );

    return alertResponse;
  }

  async report(query: { page?: string; limit?: string }) {
    const pageNumber = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const nPerPage = Math.min(100, Math.max(1, parseInt(query.limit || '50', 10) || 50));

    const match = { active: true };

    const response = await AlertProductModel.aggregate([
      { $match: match },
      { $group: { _id: '$barcode', qtd: { $sum: 1 } } },
      {
        $lookup: {
          from: 'products',
          let: { barcode: '$_id' },
          as: 'product',
          pipeline: [
            { $match: { $expr: { $eq: ['$barcode', '$$barcode'] } } },
            { $project: { name: 1, image: 1, price: 1, promoPrice: 1 } },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $sort: { qtd: -1 } },
      { $skip: (pageNumber - 1) * nPerPage },
      { $limit: nPerPage },
    ]);

    const totalResponse = await AlertProductModel.aggregate([
      { $match: match },
      { $group: { _id: '$barcode' } },
    ]).count('total');

    const total = totalResponse && totalResponse.length > 0 && totalResponse[0].total
      ? totalResponse[0].total
      : 0;

    return {
      response,
      pagination: { page: pageNumber, limit: nPerPage },
      total: { documents: total, pages: Math.ceil(total / nPerPage) },
    };
  }
}

export default new AlertProductService();
