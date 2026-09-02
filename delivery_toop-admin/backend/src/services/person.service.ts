import mongoose from 'mongoose';
import { PersonModel } from '../models/Person';
import { AppError } from '../middleware/errorHandler';

interface PersonQuery {
  page?: string;
  limit?: string;
  pageIn?: string;
  pageOut?: string;
  name?: string;
  cpf?: string;
  phone?: string;
  email?: string;
  id?: string;
  listPorNome?: string;
  sortName?: string;
  company?: string;
}

function applyScopeFilter(filter: any, query: PersonQuery) {
  if (query.company && query.company.trim()) {
    filter.company = { $in: [query.company] };
  }
  filter.deletedAt = { $exists: false };
  return filter;
}

export class PersonService {
  async list(query: PersonQuery) {
    const filter: any = {};
    applyScopeFilter(filter, query);

    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '50', 10)));

    const [data, total] = await Promise.all([
      PersonModel.find(filter)
        .populate('city')
        .populate('company')
        .populate('franchise')
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      PersonModel.countDocuments(filter),
    ]);

    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async paginator(query: PersonQuery) {
    const pageIn = Math.max(0, parseInt(String(query.pageIn ?? 0), 10));
    const pageOut = Math.max(1, parseInt(String(query.pageOut ?? 20), 10));

    const filter: any = {};
    applyScopeFilter(filter, query);

    if (query.name && typeof query.name === 'string' && query.name.trim().length > 0) {
      filter.name = { $regex: '.*' + query.name.toLowerCase() + '.*', $options: 'i' };
    }
    if (query.cpf && typeof query.cpf === 'string' && query.cpf.trim().length > 0) {
      filter.cpf = { $regex: '.*' + query.cpf.toLowerCase() + '.*', $options: 'i' };
    }

    const [list, total] = await Promise.all([
      PersonModel.find(filter)
        .populate('city')
        .populate('company')
        .populate('franchise')
        .sort({ name: 1 })
        .skip(pageIn * pageOut)
        .limit(pageOut),
      PersonModel.countDocuments(filter),
    ]);

    return { list, total };
  }

  async listPorNome(query: PersonQuery) {
    const filter: any = {};
    applyScopeFilter(filter, query);

    let limitReg = 50;
    const sort: any = {};

    if (query.limit && Number(query.limit) > 0) limitReg = Number(query.limit);
    if (query.sortName && (Number(query.sortName) === -1 || Number(query.sortName) === 1)) {
      sort.name = Number(query.sortName);
    }

    if (query.listPorNome && typeof query.listPorNome === 'string') {
      return PersonModel.find(
        {
          ...filter,
          name: { $regex: '.*' + query.listPorNome.toLowerCase() + '.*', $options: 'i' },
        },
        { name: 1 }
      )
        .limit(limitReg)
        .sort(sort)
        .lean();
    }

    return [];
  }

  async search(query: PersonQuery) {
    let filter: any = {};
    if (query.company && query.company.trim()) {
      filter = { company: { $in: [query.company] } };
    }
    filter.deletedAt = { $exists: false };

    const or: any[] = [];
    if (query.phone) or.push({ phone: query.phone });
    if (query.email) or.push({ email: query.email });
    if (query.id && mongoose.isValidObjectId(query.id)) {
      filter = {};
      or.push({ _id: query.id });
    }

    if (!or.length) throw new AppError('Filtro é obrigatório', 400);

    return PersonModel.find({ ...filter, $or: or }).lean();
  }

  async get(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Person inválido', 400);
    const doc = await PersonModel.findOne({ _id: id, deletedAt: { $exists: false } });
    if (!doc) throw new AppError('Person não encontrado', 404);
    return doc;
  }

  async avatar(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Person inválido', 400);
    const person = await PersonModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id), image: { $exists: true } } },
      { $project: { image: 1, _id: 1 } },
    ]);
    return person;
  }

  async registerDuplicates(query: { type?: string; field?: string }) {
    if (query.type === 'person' && query.field === 'phone') {
      return PersonModel.aggregate([{ $group: { _id: '$phone', nmPhone: { $sum: 2 } } }]);
    }
    if (query.type === 'person' && query.field === 'email') {
      return PersonModel.aggregate([{ $group: { _id: '$email', nmEmail: { $sum: 2 } } }]);
    }
    return {};
  }

  async create(data: any) {
    data = { ...data };
    if (typeof data.status === 'string' && data.status === '') data.status = false;
    if (data.status === null || data.status === undefined) data.status = false;
    delete data._id;

    const person = await PersonModel.create(data);
    return PersonModel.populate(person, [
      { path: 'city' },
      { path: 'company' },
      { path: 'franchise' },
    ]);
  }

  async update(id: string, data: any) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Person inválido', 400);

    data = { ...data };
    if (`${data.status}` === 'true' || `${data.status}` === 'false') {
      data.status = `${data.status}` === 'true';
    }
    if (data.ddi) {
      try {
        data.ddi = decodeURIComponent(data.ddi);
      } catch {
        // mantém ddi enviado quando não estiver codificado
      }
    }

    if (data.code) {
      const isCode = await PersonModel.findOne({ referralCode: data.code }).select({ _id: 1 }).lean();
      if (!isCode) throw new AppError('Código informado inválido', 400);
      delete data.code;
      // Indicação (IndicationModel) não migrada — criação de vínculo registrada adiante.
    }

    const doc = await PersonModel.findOneAndUpdate({ _id: id }, data, { upsert: true, new: true })
      .populate('city')
      .populate('franchise')
      .populate('company');
    if (!doc) throw new AppError('Person não encontrado', 404);
    return doc;
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Person inválido', 400);
    const doc = await PersonModel.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true });
    if (!doc) throw new AppError('Person não encontrado', 404);
    return doc;
  }
}

export default new PersonService();