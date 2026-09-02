import mongoose from 'mongoose';
import { SettingModuleModel } from '../models/SettingModule';
import { SettingControllerModel } from '../models/SettingController';
import { AccessGroupModel } from '../models/AccessGroup';
import { AppError } from '../middleware/errorHandler';

export class AccessGroupService {
  // ===================== MODULES =====================

  async listModules() {
    return SettingModuleModel.find().sort({ name: 1 });
  }

  async createModule(data: any) {
    data = { ...data };
    if (!data.name) throw new AppError('Informe um nome de módulo válido', 400);
    if (typeof data.status === 'string' && data.status === '') data.status = false;
    if (data.status === null || data.status === undefined) data.status = false;
    delete data._id;
    return SettingModuleModel.create(data);
  }

  async updateModule(id: string, data: any) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Módulo inválido', 400);
    data = { ...data };
    if (typeof data.status === 'string' && data.status === '') data.status = false;
    if (data.status === null || data.status === undefined) data.status = false;
    const doc = await SettingModuleModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!doc) throw new AppError('Módulo não encontrado', 404);
    return doc;
  }

  async deleteModule(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Módulo inválido', 400);
    await SettingModuleModel.findByIdAndDelete(id);
    return { message: 'Módulo deletado com sucesso' };
  }

  // ===================== CONTROLLERS =====================

  async listControllers() {
    return SettingControllerModel.find().populate({ path: 'module' }).sort({ name: 1 });
  }

  async createController(data: any) {
    data = { ...data };
    if (!data.name) throw new AppError('Informe um nome de controller válido', 400);
    if (!data.module) throw new AppError('Informe um módulo válido', 400);
    if (typeof data.status === 'string' && data.status === '') data.status = false;
    if (data.status === null || data.status === undefined) data.status = false;
    delete data._id;
    const controller = await SettingControllerModel.create(data);
    return SettingControllerModel.populate(controller, [{ path: 'module' }]);
  }

  async updateController(id: string, data: any) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Controller inválido', 400);
    data = { ...data };
    if (typeof data.status === 'string' && data.status === '') data.status = false;
    if (data.status === null || data.status === undefined) data.status = false;
    const doc = await SettingControllerModel.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate({ path: 'module' });
    if (!doc) throw new AppError('Controller não encontrado', 404);
    return doc;
  }

  async deleteController(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Controller inválido', 400);
    await SettingControllerModel.findByIdAndDelete(id);
    return { message: 'Controller deletado com sucesso' };
  }

  // ===================== ACCESS GROUP =====================

  async tree() {
    const groups = await AccessGroupModel.find().populate({ path: 'modules' }).sort({ name: 1 });
    const modules = await SettingModuleModel.find().sort({ name: 1 });
    return { groups, modules };
  }

  async create(data: any) {
    data = { ...data };
    if (!data.name) throw new AppError('Informe um nome de grupo de acesso válido', 400);
    if (!data.modules) throw new AppError('Informe um módulo válido', 400);
    if (typeof data.status === 'string' && data.status === '') data.status = false;
    if (data.status === null || data.status === undefined) data.status = false;
    delete data._id;
    const group = await AccessGroupModel.create(data);
    return AccessGroupModel.populate(group, [{ path: 'modules' }]);
  }

  async update(id: string, data: any) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Access Group inválido', 400);
    data = { ...data };
    if (typeof data.status === 'string' && data.status === '') data.status = false;
    if (data.status === null || data.status === undefined) data.status = false;
    const doc = await AccessGroupModel.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate({ path: 'modules' });
    if (!doc) throw new AppError('Access Group não encontrado', 404);
    return doc;
  }

  async remove(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Access Group inválido', 400);
    await AccessGroupModel.findByIdAndDelete(id);
    return { message: 'Access Group deletado com sucesso' };
  }
}

export default new AccessGroupService();
