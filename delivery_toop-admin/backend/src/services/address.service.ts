import { StateBrModel } from '../models/StateBr';
import { AddressCityModel } from '../models/AddressCity';

class AddressService {
  async listState() {
    return StateBrModel.find({}).sort({ nome: 1 }).lean();
  }

  async listCity(query: any) {
    const codigo_uf = query.codigo_uf != null ? Number(query.codigo_uf) : null;
    const nome = query.nome ? String(query.nome) : null;

    const filter: any = {};
    if (codigo_uf != null && !isNaN(codigo_uf)) {
      filter.codigo_uf = codigo_uf;
    }
    if (nome) {
      filter.$text = { $search: nome.toLowerCase() };
    }

    return AddressCityModel.find(filter).sort({ nome: 1 }).lean();
  }
}

export default new AddressService();
