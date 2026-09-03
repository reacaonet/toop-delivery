import mongoose from 'mongoose';
import { SettingStateModel } from '../models/SettingState';
import { SettingCityModel } from '../models/SettingCity';
import { TimeZoneModel } from '../models/TimeZone';
import { SettingTypesUsersModel } from '../models/SettingTypesUsers';
import { AppVersionModel } from '../models/AppVersion';
import { SettingBrazilianBanksModel } from '../models/SettingBrazilianBanks';
import { GlobalSettingsModel } from '../models/GlobalSettings';
import { FranchiseModel } from '../models/Franchise';
import { AppError } from '../middleware/errorHandler';

function isObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

/* ------------------------------------------------------------------ */
/* State                                                                */
/* ------------------------------------------------------------------ */
export class DomainSettingsService {
  async listStates(query: any) {
    const { id, hasFranchise } = query;
    let data: any = {};

    if (id && !isObjectId(id)) {
      throw new AppError('Id do Estado inválido', 400);
    }

    if (id) {
      data._id = id;
    }

    if (hasFranchise) {
      const franchises = await FranchiseModel.find(
        { deletedAt: { $exists: false } },
        { state: 1, _id: 0 }
      ).lean();
      const ids = franchises
        .map((f: any) => f.state)
        .filter((s: any) => isObjectId(s));
      data._id = { $in: ids };
    }

    return SettingStateModel.find(data).sort({ name: 1 });
  }

  async listStateByNome(listPorNome?: string) {
    if (!listPorNome || typeof listPorNome !== 'string' || !listPorNome.trim()) {
      return [];
    }
    return SettingStateModel.find(
      { name: { $regex: '.*' + listPorNome.toLowerCase() + '.*', $options: 'i' } },
      { name: 1 }
    );
  }

  async createState(data: any) {
    if (!data.name || !data.uf) {
      throw new AppError('Informe nome e UF do estado', 400);
    }
    return SettingStateModel.create(data);
  }

  async updateState(id: string, data: any) {
    if (!isObjectId(id)) {
      throw new AppError('Id do Estado inválido', 400);
    }
    const updated = await SettingStateModel.findOneAndUpdate({ _id: id }, data, {
      new: true,
    });
    if (!updated) {
      throw new AppError('Estado não encontrado', 404);
    }
    return updated;
  }

  async removeState(id: string) {
    if (!isObjectId(id)) {
      throw new AppError('Id do Estado inválido', 400);
    }
    const removed = await SettingStateModel.findByIdAndDelete(id);
    if (!removed) {
      throw new AppError('Estado não encontrado', 404);
    }
    return removed;
  }

  /* ------------------------------------------------------------------ */
  /* City                                                                */
  /* ------------------------------------------------------------------ */
  async listCities(query: any) {
    const { id, state, name, hasFranchise } = query;
    let data: any = { deletedAt: { $exists: false } };

    if (state && !isObjectId(state)) {
      throw new AppError('Id Estado inválido', 400);
    }
    if (id && !isObjectId(id)) {
      throw new AppError('ID da cidade inválida', 400);
    }

    if (id) {
      return SettingCityModel.findById(id).populate('state', { name: 1, uf: 1 });
    }

    if (state) {
      data.state = state;
    }
    if (name && name.length) {
      data.name = { $regex: '.*' + name.toLowerCase() + '.*', $options: 'i' };
    }

    let response: any[];

    if (hasFranchise) {
      const franchises = await FranchiseModel.find(
        { status: true, deletedAt: { $exists: false } },
        { city: 1, state: 1, _id: 1 }
      ).lean();
      data._id = {
        $in: (franchises as any[])
          .filter((f) => isObjectId(f.city))
          .map((f) => f.city),
      };
      const list = await SettingCityModel.find(data)
        .populate('state', { name: 1, uf: 1 })
        .lean();
      response = list.map((c: any) => ({
        ...c,
        franchise: fragments(franchises, 'city', c._id),
      }));
    } else {
      response = await SettingCityModel.find(data).populate('state', { name: 1, uf: 1 });
    }

    return response;
  }

  async paginateCities(query: any) {
    const { pageIn, pageOut, name } = query;
    const from = parseInt(pageIn, 10);
    const size = parseInt(pageOut, 10);
    if (Number.isNaN(from) || Number.isNaN(size)) {
      throw new AppError('Dados da paginação inválidos', 400);
    }

    const filter: any = { deletedAt: { $exists: false } };
    if (name && typeof name === 'string' && name.trim().length > 0) {
      filter.name = { $regex: '.*' + name.toLowerCase() + '.*', $options: 'i' };
    }

    const [list, total] = await Promise.all([
      SettingCityModel.find(filter)
        .populate('state', { name: 1, uf: 1 })
        .sort({ createdAt: -1 })
        .limit(size)
        .skip(from * size),
      SettingCityModel.countDocuments(filter),
    ]);

    return { list, total };
  }

  async createCity(data: any) {
    if (!data.name || !data.state) {
      throw new AppError('Informe nome e estado da cidade', 400);
    }
    if (!isObjectId(data.state)) {
      throw new AppError('Id do Estado inválido', 400);
    }
    const city = await SettingCityModel.create(data);
    return city.populate('state', { name: 1, uf: 1 });
  }

  async updateCity(id: string, data: any) {
    if (!isObjectId(id)) {
      throw new AppError('ID da cidade inválida', 400);
    }
    const updated = await SettingCityModel.findOneAndUpdate({ _id: id }, data, {
      new: true,
    }).populate('state', { name: 1, uf: 1 });
    if (!updated) {
      throw new AppError('Cidade não encontrada', 404);
    }
    return updated;
  }

  async removeCity(id: string) {
    if (!isObjectId(id)) {
      throw new AppError('ID da cidade inválida', 400);
    }
    const removed = await SettingCityModel.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date() } },
      { new: true }
    );
    if (!removed) {
      throw new AppError('Cidade não encontrada', 404);
    }
    return removed;
  }

  /** Normaliza latitude/longitude das cidades buscando no catálogo de cidades IBGE (se existir). */
  async normalizeCities() {
    let normalized = 0;

    let AddressCityModel: any = null;
    try {
      const mod = await import('../models/AddressCity');
      AddressCityModel = (mod as any).AddressCityModel || (mod as any).default;
    } catch {
      AddressCityModel = null;
    }

    const cities = await SettingCityModel.find({ deletedAt: { $exists: false } }).lean();
    for (const city of cities) {
      let lat: number | undefined;
      let lng: number | undefined;

      if (AddressCityModel && !city.latitude) {
        const res = await AddressCityModel.findOne({
          nome: { $regex: '.*' + city.name.trim().toLowerCase() + '.*', $options: 'i' },
        }).lean();
        if (res) lat = res.latitude;
      }
      if (AddressCityModel && !city.longitude) {
        const res = await AddressCityModel.findOne({
          nome: { $regex: '.*' + city.name.trim().toLowerCase() + '.*', $options: 'i' },
        }).lean();
        if (res) lng = res.longitude;
      }

      if (lat !== undefined) {
        await SettingCityModel.updateOne({ _id: city._id }, { latitude: lat });
        normalized += 1;
      }
      if (lng !== undefined) {
        await SettingCityModel.updateOne({ _id: city._id }, { longitude: lng });
        normalized += 1;
      }
    }

    return { message: 'sucesso', normalized, catalogAvailable: !!AddressCityModel };
  }

  /* ------------------------------------------------------------------ */
  /* TypesUsers                                                          */
  /* ------------------------------------------------------------------ */
  async listTypesUsers(query: any) {
    const { id } = query;
    const data: any = { deletedAt: { $exists: false } };

    if (id && !isObjectId(id)) {
      throw new AppError('ID inválido', 400);
    }
    if (id) {
      data._id = id;
      const one = await SettingTypesUsersModel.findOne(data);
      return one ? [one] : [];
    }

    return SettingTypesUsersModel.find(data).sort({ name: 1 });
  }

  async paginateTypesUsers(query: any) {
    const { pageIn, pageOut, name } = query;
    const from = parseInt(pageIn, 10);
    const size = parseInt(pageOut, 10);
    if (Number.isNaN(from) || Number.isNaN(size)) {
      throw new AppError('Dados da paginação inválidos', 400);
    }

    const filter: any = { deletedAt: { $exists: false } };
    if (name && typeof name === 'string' && name.trim().length > 0) {
      filter.name = { $regex: '.*' + name.toLowerCase() + '.*', $options: 'i' };
    }

    const [list, total] = await Promise.all([
      SettingTypesUsersModel.find(filter).sort({ createdAt: -1 }).limit(size).skip(from * size),
      SettingTypesUsersModel.countDocuments(filter),
    ]);

    return { list, total };
  }

  async createTypesUsers(data: any) {
    if (!data.name) {
      throw new AppError('Informe o nome do tipo de usuário', 400);
    }
    const status =
      (typeof data.status === 'string' && data.status === '') || data.status === null
        ? false
        : data.status;
    return SettingTypesUsersModel.create({ ...data, status: status ?? false });
  }

  async updateTypesUsers(id: string, data: any) {
    if (!isObjectId(id)) {
      throw new AppError('ID inválido', 400);
    }
    const status =
      (typeof data.status === 'string' && data.status === '') || data.status === null
        ? false
        : data.status;
    if (status !== undefined) data.status = status;
    const updated = await SettingTypesUsersModel.findOneAndUpdate({ _id: id }, data, {
      new: true,
    });
    if (!updated) {
      throw new AppError('Registro não encontrado', 404);
    }
    return updated;
  }

  async removeTypesUsers(id: string) {
    if (!isObjectId(id)) {
      throw new AppError('ID inválido', 400);
    }
    const removed = await SettingTypesUsersModel.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date() } },
      { new: true }
    );
    if (!removed) {
      throw new AppError('Registro não encontrado', 404);
    }
    return removed;
  }

  /* ------------------------------------------------------------------ */
  /* AppVersion                                                          */
  /* ------------------------------------------------------------------ */
  async listAppVersions() {
    return AppVersionModel.find({ deletedAt: { $exists: false } }).sort({ createdAt: -1 });
  }

  async createAppVersion(data: any) {
    if (!data.version || !data.platform) {
      throw new AppError('Informe versão e plataforma (ios/android)', 400);
    }
    if (!['ios', 'android'].includes(data.platform)) {
      throw new AppError('Plataforma inválida (use ios ou android)', 400);
    }
    if (!data.status || data.status === true) {
      await AppVersionModel.updateMany({ platform: data.platform }, { status: false });
    }
    return AppVersionModel.create(data);
  }

  async checkAppVersion(query: any) {
    const { version, platform } = query;
    if (!version && !platform) {
      throw new AppError('Parâmetros não informados', 400);
    }

    const last = await AppVersionModel.findOne({
      deletedAt: { $exists: false },
      status: true,
      platform,
    }).sort({ createdAt: -1 });

    if (!last) {
      throw new AppError('Nenhuma versão criada', 400);
    }

    return {
      forceUpdate: last.version !== version,
      version: last.version,
      platform: last.platform,
    };
  }

  /* ------------------------------------------------------------------ */
  /* TimeZone                                                            */
  /* ------------------------------------------------------------------ */
  async listTimeZones() {
    return TimeZoneModel.find().sort({ offset: -1 });
  }

  /* ------------------------------------------------------------------ */
  /* Countries (estático)                                                */
  /* ------------------------------------------------------------------ */
  listCountries(language?: string) {
    const list = [
      { name: 'Brasil', value: '+55', mask: '(99) 99999-9999', min: 11, max: 11 },
      { name: 'Portugal', value: '+351', mask: '999999999', min: 9, max: 9 },
      { name: 'Angola', value: '+244', mask: '999999999', min: 9, max: 9 },
    ];
    if (language === 'pt-AO') return reorderCountries('Angola', list);
    if (language === 'pt' || language === 'pt-PT') return reorderCountries('Portugal', list);
    return list;
  }

  /* ------------------------------------------------------------------ */
  /* App/:franchise (configurações do app da franquia)                   */
  /* ------------------------------------------------------------------ */
  async appSettings(franchiseId: string) {
    if (!isObjectId(franchiseId)) {
      throw new AppError('Id de franquia inválido', 400);
    }
    const franchise = await FranchiseModel.findOne({ _id: franchiseId })
      .select('serviceDefault languageDefault coin emergencyPhone')
      .lean();
    if (!franchise) {
      throw new AppError('Franquia não encontrada', 404);
    }
    delete (franchise as any)._id;
    return franchise;
  }

  /* ------------------------------------------------------------------ */
  /* BrazilianBanks                                                      */
  /* ------------------------------------------------------------------ */
  async listBrazilianBanks(query: any) {
    const { name } = query;
    const filter: any = {};
    if (name) {
      const decodeName = decodeURIComponent(name);
      filter.long_name = { $regex: '.*' + decodeName.toLowerCase() + '.*', $options: 'i' };
    }
    return SettingBrazilianBanksModel.find(filter, {
      _id: 1,
      compe: 1,
      long_name: 1,
      short_name: 1,
    });
  }

  /* ------------------------------------------------------------------ */
  /* GlobalSettings                                                      */
  /* ------------------------------------------------------------------ */
  async getGlobalSettings() {
    let settings = await GlobalSettingsModel.findOne();
    if (!settings) {
      settings = await GlobalSettingsModel.create({});
    }
    return settings;
  }
}

function fragments(list: any[], key: string, id: any): any {
  return list.find((i) => `${i[key]}`.toString() === `${id}`.toString());
}

function reorderCountries(name: string, list: any[]) {
  const index = list.findIndex((item) => `${item.name}` === `${name}`);
  if (index > -1) {
    const item = list[index];
    list.splice(index, 1);
    list = [item].concat(list);
  }
  return list;
}

export default new DomainSettingsService();
