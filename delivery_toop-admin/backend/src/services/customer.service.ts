import mongoose from 'mongoose';
import { CustomerModel } from '../models/Customer';
import { PersonModel } from '../models/Person';
import { FranchiseModel } from '../models/Franchise';
import { AppError } from '../middleware/errorHandler';

interface CustomerQuery {
  page?: string;
  limit?: string;
  franchise?: string;
  listPorNome?: string;
  id?: string;
  ddi?: string;
  phone?: string;
  email?: string;
  person?: string;
  name?: string;
}

function getRandom(number: number): string {
  const s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let generate = '';
  for (let i = 0; i < number; i += 1) {
    generate += s.charAt(Math.floor(Math.random() * s.length));
  }
  return `${generate}${new Date().getTime()}`;
}

async function uniqueSku(): Promise<string> {
  const sku = getRandom(18);
  const exists = await CustomerModel.findOne({ sku }).select({ sku: 1 }).lean();
  if (!exists) return sku;
  return uniqueSku();
}

async function franchiseGeoFilter(franchiseId?: string): Promise<Record<string, unknown> | null> {
  if (!franchiseId || !mongoose.isValidObjectId(franchiseId)) return null;
  const franchise = await FranchiseModel.findById(franchiseId).lean();
  if (!franchise || !franchise.location || !franchise.location.coordinates) return null;
  const [lng, lat] = franchise.location.coordinates;
  return {
    $geoWithin: {
      $centerSphere: [[Number(lng), Number(lat)], Number(500 / 3963.2)],
    },
  };
}

class CustomerService {
  async paginator(query: CustomerQuery) {
    const { page, limit } = query;
    if (!page || !limit) throw new AppError('Dados da paginação inválidos', 400);

    const filter: any = {};
    const geo = await franchiseGeoFilter(query.franchise);
    if (geo) filter['address.location'] = geo;

    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    const listPipeline = [
      {
        $lookup: {
          from: 'customer_delivery_address',
          let: { customerId: '$_id' },
          as: 'address',
          pipeline: [
            { $match: { $expr: { $eq: ['$customer', '$$customerId'] }, main: true, isDeleted: false } },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: '$address', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'person',
          localField: 'person',
          foreignField: '_id',
          as: 'person',
        },
      },
      { $unwind: { path: '$person', preserveNullAndEmptyArrays: true } },
      { $match: filter },
      { $skip: pageNum * limitNum },
      { $limit: limitNum },
    ];

    const list = await CustomerModel.aggregate(listPipeline);

    const totalPipeline = [
      {
        $lookup: {
          from: 'customer_delivery_address',
          let: { customerId: '$_id' },
          as: 'address',
          pipeline: [
            { $match: { $expr: { $eq: ['$customer', '$$customerId'] }, main: true, isDeleted: false } },
            { $project: { location: 1 } },
            { $limit: 1 },
          ],
        },
      },
      { $unwind: { path: '$address', preserveNullAndEmptyArrays: true } },
      { $match: filter },
      { $group: { _id: {}, total: { $sum: 1 } } },
    ];
    const totalAgg = await CustomerModel.aggregate(totalPipeline);
    const total = totalAgg && totalAgg.length > 0 ? totalAgg[0].total : 0;

    return { list, total };
  }

  async list(id?: string) {
    if (id) {
      if (!mongoose.isValidObjectId(id)) throw new AppError('Usuário não encontrado', 400);
      return CustomerModel.findById(id).populate('person');
    }
    return CustomerModel.find();
  }

  async listPorNome(listPorNome?: string) {
    if (!listPorNome || typeof listPorNome !== 'string') return [];
    return CustomerModel.aggregate([
      {
        $lookup: {
          from: 'person',
          localField: 'person',
          foreignField: '_id',
          as: 'person',
        },
      },
      { $unwind: { path: '$person', preserveNullAndEmptyArrays: true } },
      { $match: { 'person.name': { $regex: '.*' + listPorNome.toLowerCase() + '.*', $options: 'i' } } },
      { $project: { name: '$person.name', email: 1, phone: 1, person: 1 } },
    ]);
  }

  async create(data: any) {
    data = { ...data };
    data.sku = await uniqueSku();

    const customer = await CustomerModel.create(data);
    return CustomerModel.populate(customer, { path: 'person' });
  }

  async update(id: string, data: any) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Customer inválido', 400);
    data = { ...data };
    if (data.ddi) {
      try {
        data.ddi = decodeURIComponent(data.ddi);
      } catch {
        // mantém ddi enviado quando não estiver codificado
      }
    }

    const doc = await CustomerModel.findOneAndUpdate({ _id: id }, data, { new: true });
    if (!doc) throw new AppError('Customer não encontrado', 404);

    if (!doc.sku) {
      const sku = await uniqueSku();
      if (sku) await CustomerModel.updateOne({ _id: id }, { sku });
    }

    return CustomerModel.populate(doc, { path: 'person' });
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Customer inválido', 400);
    await CustomerModel.findByIdAndDelete(id);
    return {};
  }

  async search(query: CustomerQuery) {
    const { ddi = null } = query;
    const or: any[] = [];
    if (query.phone) or.push({ phone: new RegExp(query.phone, '') });
    if (query.email) or.push({ email: query.email });
    if (query.person) or.push({ person: query.person });

    if (!or.length) throw new AppError('Filtro é obrigatório', 400);

    const customer = await CustomerModel.findOne({ $or: or }).populate('person').lean();

    if (customer && customer._id && !customer.ddi && ddi) {
      await CustomerModel.updateOne({ _id: customer._id }, { ddi: `${ddi}` });
      if (customer.person && (customer.person as any)._id) {
        await PersonModel.updateOne({ _id: (customer.person as any)._id }, { ddi: `${ddi}` });
      }
    }

    return customer;
  }

  async searchCustomer(query: CustomerQuery) {
    const { email, phone } = query;
    let limitPage = 10;

    if (!email && !phone) throw new AppError('Informe um email ou telefone', 400);

    const or: any[] = [];
    if (email) or.push({ email: { $regex: '.*' + email.toLowerCase() + '.*', $options: 'i' } });
    if (phone) or.push({ phone: { $regex: '.*' + String(phone).toLowerCase() + '.*', $options: 'i' } });

    if (query.limit && Number(query.limit) > 0) limitPage = Number(query.limit);

    return CustomerModel.find({ $or: or })
      .select({ person: 1, email: 1, phone: 1, instanceIdToken: 1 })
      .limit(limitPage)
      .lean();
  }

  async searchPersonCustomer(query: CustomerQuery) {
    const { name } = query;
    if (!name || `${name}`.length <= 1) throw new AppError('Informe um campo para filtrar', 400);

    const or: any[] = [
      { name: { $regex: '.*' + `${name}`.toLowerCase() + '.*', $options: 'i' } },
      { email: { $regex: '.*' + `${name}`.toLowerCase() + '.*', $options: 'i' } },
      {
        $expr: {
          $regexMatch: {
            input: { $toString: '$phone' },
            regex: `${name}`.toLowerCase(),
            options: 'i',
          },
        },
      },
    ];

    const filter: any = { status: true, deletedAt: { $exists: false }, $or: or };

    const geo = await franchiseGeoFilter(query.franchise);
    const matchAfterUnwind: any = { 'customer._id': { $exists: true } };
    if (geo && geo['address.location']) matchAfterUnwind['customer.deliveryAddress.location'] = geo['address.location'];

    return PersonModel.aggregate([
      { $match: filter },
      { $project: { name: 1, email: 1, phone: { $toString: '$phone' } } },
      {
        $lookup: {
          from: 'customer',
          let: { person: '$_id' },
          as: 'customer',
          pipeline: [
            { $match: { $expr: { $eq: ['$person', '$$person'] } } },
            { $project: { _id: 1, deliveryAddress: 1 } },
            { $limit: 1 },
            {
              $lookup: {
                from: 'customer_delivery_address',
                let: { customer: '$_id' },
                as: 'deliveryAddress',
                pipeline: [
                  { $match: { $expr: { $eq: ['$customer', '$$customer'] }, main: true, isDeleted: false } },
                  { $project: { _id: 1, location: 1 } },
                  { $limit: 1 },
                ],
              },
            },
            { $unwind: { path: '$deliveryAddress', preserveNullAndEmptyArrays: true } },
          ],
        },
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
      { $match: matchAfterUnwind },
      { $limit: 10 },
    ]);
  }
}

export default new CustomerService();