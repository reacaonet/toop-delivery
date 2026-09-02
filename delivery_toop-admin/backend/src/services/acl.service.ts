import mongoose from 'mongoose';
import { RoleModel } from '../models/Role';
import { PermissionModel } from '../models/Permission';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';

interface PageQuery {
  page?: string;
  limit?: string;
  pageIn?: string;
  pageOut?: string;
  listPorNome?: string;
  search?: string;
}

function normalizeStatus(value: any): boolean {
  if (value === '' || value === null || value === undefined) return false;
  return value;
}

export class AclService {
  // ===================== ROLES =====================

  async listRoles() {
    return RoleModel.find().sort({ name: 1 });
  }

  async paginatorRoles(query: PageQuery) {
    const pageIn = Math.max(0, parseInt(String(query.pageIn ?? 0), 10));
    const pageOut = Math.max(1, parseInt(String(query.pageOut ?? 20), 10));

    const filter: any = {};
    const search = (query.listPorNome || query.search || '').trim();
    if (search) filter.name = { $regex: '.*' + search.toLowerCase() + '.*', $options: 'i' };

    const [list, total] = await Promise.all([
      RoleModel.find(filter).sort({ createdAt: -1 }).skip(pageIn * pageOut).limit(pageOut),
      RoleModel.countDocuments(filter),
    ]);
    return { list, total };
  }

  async listRolesPorNome(query: PageQuery) {
    const search = (query.listPorNome || '').trim();
    if (!search) return [];
    return RoleModel.find({ name: { $regex: '.*' + search.toLowerCase() + '.*', $options: 'i' } }, { name: 1 }).sort({ name: 1 });
  }

  async createRole(data: any) {
    data = { ...data };
    data.status = normalizeStatus(data.status);
    delete data._id;
    return RoleModel.create(data);
  }

  async updateRole(id: string, data: any) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Role inválido', 400);
    if (data.name === '') delete data.name;
    data.status = normalizeStatus(data.status);
    const doc = await RoleModel.findOneAndUpdate({ _id: id }, data, { upsert: true, new: true, runValidators: true });
    if (!doc) throw new AppError('Role não encontrado', 404);
    return doc;
  }

  async deleteRole(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Role inválido', 400);
    await RoleModel.findByIdAndDelete(id);
    return { message: 'Role deletado com sucesso' };
  }

  // ===================== PERMISSIONS =====================

  async listPermissions() {
    return PermissionModel.find().populate({ path: 'roles' }).sort({ title: 1 });
  }

  async paginatorPermissions(query: PageQuery) {
    const pageIn = Math.max(0, parseInt(String(query.pageIn ?? 0), 10));
    const pageOut = Math.max(1, parseInt(String(query.pageOut ?? 20), 10));

    const filter: any = {};

    const [list, total] = await Promise.all([
      PermissionModel.find(filter)
        .populate({ path: 'roles', select: { name: 1 } })
        .sort({ createdAt: -1 })
        .skip(pageIn * pageOut)
        .limit(pageOut),
      PermissionModel.countDocuments(filter),
    ]);
    return { list, total };
  }

  async createPermission(data: any) {
    data = { ...data };
    delete data._id;
    if (!data.roles) throw new AppError('Informe um role válido', 400);
    if (!data.route) throw new AppError('Informe a rota da permissão', 400);
    if (data.level === undefined || data.level === null || data.level === '') throw new AppError('Informe o nível da permissão', 400);
    if (!data.title) throw new AppError('Informe o título da permissão', 400);
    const permission = await PermissionModel.create(data);
    return PermissionModel.populate(permission, [{ path: 'roles' }]);
  }

  async updatePermission(id: string, data: any) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Permission inválido', 400);
    data = { ...data };
    if (data.name === '') delete data.name;
    const doc = await PermissionModel.findOneAndUpdate({ _id: id }, data, { upsert: true, new: true, runValidators: true })
      .populate({ path: 'roles' });
    if (!doc) throw new AppError('Permission não encontrado', 404);
    return doc;
  }

  async deletePermission(id: string) {
    if (!mongoose.isValidObjectId(id)) throw new AppError('Permission inválido', 400);
    await PermissionModel.findByIdAndDelete(id);
    return { message: 'Permission deletado com sucesso' };
  }

  // ===================== USERS / ACL Context =====================

  async users(userId: string) {
    if (!mongoose.isValidObjectId(userId)) throw new AppError('Usuário inválido', 401);

    const userLogged = await UserModel.findOne({ _id: userId }, {})
      .populate({ path: 'company', select: { name: 1, type: 1, shoppingFlow: 1 } })
      .lean();

    if (!userLogged) throw new AppError('Usuário não encontrado', 401);

    const u = userLogged as any;
    const isRoot = u.role === 'admin';
    const hasCompany = !!u.company;

    const roles: number[] = [];
    const permissions: any[] = [];

    if (isRoot || !hasCompany) {
      roles.push(1);
      permissions.push({ id: 'ECBR-ROOT', name: 'accessToRoot', level: 1, title: 'Franchises Module' });
      permissions.push({ id: 'ECBR', name: 'accessToGlobal', level: 1, title: 'Dashboard module' });
    } else {
      roles.push(2);
      let typePermissions = (u.company && u.company.shoppingFlow) || 'MENU';
      if (!u.company || !u.company.shoppingFlow) {
        typePermissions = u.company && u.company.type === 'supermarket' ? 'PRODUCT' : 'MENU';
      }
      if (typePermissions === 'MENU') {
        permissions.push(
          { id: '5e8658970775173a7838ea72', name: 'accessToFoodMenu', route: 'delivery-products', level: 1, title: 'Menu module' },
          { id: '5e87658c3080b03a40fe4b82', name: 'accessToFoodOrders', route: 'shopping-cart/restaurant', level: 1, title: 'Food Orders module' },
          { id: '5e8765fb3080b03a40fe4b84', name: 'accessToHoursCompany', route: 'company/opening-hours', level: 1, title: 'Company Opening Hours module' },
          { id: '5e8765fb3080b03a40fe4b86', name: 'accessToCompanyDelivery', route: 'company/delivery', level: 1, title: 'Company Delivery' },
          { id: '5ee10e8edbfda3d9b329ffcf', name: 'accessToTransactions', route: '/finance/invoice', level: 1, title: 'Permission Transactions' },
          { id: '61365ba3d3b731d4eb8f1104', name: 'accessToReportFinance', route: '/report/financial-company', level: 1, title: 'Report Finance' },
        );
      } else if (typePermissions === 'PRODUCT') {
        permissions.push(
          { id: '5e8765fb3080b03a40fe4b86', name: 'accessToCompanyDelivery', route: 'company/delivery', level: 1, title: 'Company Delivery' },
          { id: '5e8765183080b03a40fe4b81', name: 'accessToRegisterProduct', route: 'register-product', level: 1, title: 'Product List module' },
          { id: '5e8765de3080b03a40fe4b83', name: 'accessToMarketOrders', route: 'shopping-cart/supermarket', level: 1, title: 'Market Orders module' },
          { id: '5e8765fb3080b03a40fe4b84', name: 'accessToHoursCompany', route: 'company/opening-hours', level: 1, title: 'Company Opening Hours module' },
          { id: '5ee10e8edbfda3d9b329ffcf', name: 'accessToTransactions', route: '/finance/invoice', level: 1, title: 'Permission Transactions' },
          { id: '61365ba3d3b731d4eb8f1104', name: 'accessToReportFinance', route: '/report/financial-company', level: 1, title: 'Report Finance' },
        );
      }
    }

    return {
      id: u._id || undefined,
      username: u.email,
      email: u.email,
      roles,
      permissions,
      company: u.company,
      pic: './assets/media/users/default.jpg',
      fullname: u.name,
      occupation: 'ecbr',
      companyName: 'ecbr',
      phone: u.phone ? u.phone : '',
      address: { addressLine: 'ecbr', city: 'ecbr', state: 'ecbr', postCode: 'ecbr' },
      socialNetworks: { linkedIn: 'ecbr', facebook: 'ecbr', twitter: 'ecbr', instagram: 'ecbr' },
    };
  }
}

export default new AclService();
