import { PreRegistrationModel } from "../models/PreRegistration";
import { DynamicPreRegisterModel } from "../models/DynamicPreRegister";
import { AppError } from "../middleware/errorHandler";

function lower(v: any) {
  return typeof v === "string" ? v.toLowerCase().trim() : v;
}

export class PreRegisterService {
  // POST / — cria por telefone/ddi, liberando reenvio quando DECLINED
  async create(body: any) {
    const { phone, ddi = null } = body;
    if (!phone) throw new AppError("Informe um telefone", 400);

    const filter: any = { phone };
    if (ddi) filter.ddi = ddi;

    const existing = await PreRegistrationModel.findOne(filter).sort({ createdAt: -1 });

    if (existing) {
      if (existing.status === "DECLINED") {
        await PreRegistrationModel.replaceOne(
          { _id: existing._id },
          { createdAt: new Date(), ddi: existing.ddi ?? "+55", phone, status: "RESENT", terms: false }
        );
        return { message: "registro recusado, liberado para um novo cadastro", data: { _id: existing._id, phone, status: "RESENT", terms: false } };
      }
      return { message: "Cadastro já existe", data: existing };
    }

    const created = await PreRegistrationModel.create({ ddi: ddi ?? "+55", phone });
    return { message: "Informação salva", data: created };
  }

  // GET /:phone — retorna registro por telefone (exceto APPROVED)
  async listByPhone(phone: string, ddi?: string) {
    const filter: any = { phone, status: { $ne: "APPROVED" } };
    if (ddi) filter.ddi = ddi;
    return PreRegistrationModel.findOne(filter).sort({ createdAt: -1 });
  }

  // PUT /:id — atualiza o registro (com validações básicas)
  async update(id: string, data: any) {
    const current = await PreRegistrationModel.findById(id);
    if (!current) throw new AppError("Registro não encontrado", 404);

    if (current.status === "DECLINED") {
      await PreRegistrationModel.replaceOne(
        { _id: current._id },
        { createdAt: new Date(), phone: current.phone, status: "RESENT", terms: false }
      );
      return { message: "Registro recusado liberado para novo cadastro", data: { _id: current._id, phone: current.phone, status: "RESENT", terms: false } };
    }

    const payload: any = { ...data };

    if (payload.email !== undefined) {
      const email = lower(payload.email);
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email)) throw new AppError("E-mail inválido", 400);
      const dup = await PreRegistrationModel.findOne({ _id: { $ne: id }, email, deletedAt: { $exists: false } });
      if (dup) throw new AppError("Email informado já está em uso", 400);
      payload.email = email;
    }
    if (payload.cpf !== undefined) {
      if (!/^\d{11}$/.test(String(payload.cpf).replace(/\D/g, ""))) throw new AppError("Informe um CPF válido", 400);
      const dup = await PreRegistrationModel.findOne({ _id: { $ne: id }, cpf: payload.cpf, deletedAt: { $exists: false } });
      if (dup) throw new AppError("CPF informado já está em uso", 400);
    }
    if (payload.password !== undefined && payload.password.length < 6) {
      throw new AppError("Informe uma senha com pelo menos 6 caracteres", 400);
    }
    if (payload.genre !== undefined && payload.genre !== "H" && payload.genre !== "M") {
      throw new AppError("Selecione um gênero", 400);
    }

    const updated = await PreRegistrationModel.findOneAndUpdate({ _id: id }, payload, { upsert: true, new: true });
    return updated;
  }

  // DELETE /:id — soft delete
  async remove(id: string) {
    const doc = await PreRegistrationModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    if (!doc) throw new AppError("Registro não encontrado", 404);
    return { message: "Registro deletado com sucesso" };
  }

  // GET /paginator — paginação para o painel (sem escopo de franquia no autônomo)
  async paginator(query: any) {
    const pageIn = parseInt(query.pageIn, 10);
    const pageOut = parseInt(query.pageOut, 10);
    const filter: any = { deletedAt: { $exists: false } };

    if (query.email) filter.email = new RegExp(lower(query.email), "i");
    if (query.name) filter.name = new RegExp(lower(query.name), "i");
    if (query.phone) filter.phone = new RegExp(String(query.phone), "i");
    if (query.cpf) filter.cpf = new RegExp(String(query.cpf), "i");
    if (query.status && query.status !== "ALL") filter.status = query.status;

    if (!Number.isInteger(pageIn) || !Number.isInteger(pageOut) || pageOut <= 0) {
      return { list: [], total: 0 };
    }

    const [list, total] = await Promise.all([
      PreRegistrationModel.find(filter)
        .populate("franchise")
        .sort({ createdAt: -1 })
        .skip(pageIn * pageOut)
        .limit(pageOut),
      PreRegistrationModel.countDocuments(filter),
    ]);
    return { list, total };
  }

  // GET /dynamic — motor de telas (público)
  async listViews(query: any) {
    const { ddi = "+55", phone, id } = query;
    let ufilter: any;
    if (id) ufilter = { _id: id };
    else if (ddi && phone) ufilter = { ddi: String(ddi).trim(), phone: String(phone).trim() };
    else throw new AppError("Informe um filtro", 401);

    ufilter.status = { $ne: "APPROVED" };
    ufilter.deletedAt = { $exists: false };

    const preRegister = await PreRegistrationModel.findOne(ufilter).sort({ createdAt: -1 });
    if (!preRegister) throw new AppError("Cadastro não encontrado", 404);

    const dFilter: any = {};
    if (preRegister.country) dFilter.country = preRegister.country;
    if (preRegister.viewNextRegister) dFilter.view = preRegister.viewNextRegister;
    else { dFilter.view = "country"; delete dFilter.country; }

    const items = await DynamicPreRegisterModel.find(dFilter);
    const view: any[] = [];
    let footer;
    for (const item of items) {
      const entry: any = {
        view: item.view,
        nextView: item.nextView,
        uploadDocPhoto: item.uploadDocPhoto,
        inputType: item.inputType,
        inputGroup: item.inputGroup,
        listPopulate: item.listPopulate,
      };
      if (item.uploadDocPhoto) {
        Object.assign(entry, item.uploadDocPhotoPayload as any);
      }
      if (item.inputType) {
        const ip: any = item.inputTypePayload ? { ...(item.inputTypePayload as any) } : {};
        if (item.inputType === "list" && item.listPopulate === "getFranchise" && !ip.list) {
          ip.list = [];
        }
        entry.inputTypePayload = { ...ip, mask: item.inputTypePayload?.mask };
      }
      if (item.footer) footer = item.footer;
      view.push(entry);
    }

    return { user: preRegister, view, footer };
  }

  // POST /dynamic — cria config de tela dinâmica (público no legado)
  async createDynamic(data: any) {
    return DynamicPreRegisterModel.create(data);
  }

  // POST /dynamic-record/:id — salva um passo do cadastro
  async saveDynamicRecord(id: string, data: any, headers: any) {
    const current = await PreRegistrationModel.findOne({ _id: id, deletedAt: { $exists: false } });
    if (!current) throw new AppError("Nenhum cadastro encontrado", 400);

    const payload: any = { ...data };

    if (payload.email !== undefined) {
      const email = lower(payload.email);
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email)) throw new AppError("E-mail inválido", 400);
      const dup = await PreRegistrationModel.findOne({ _id: { $ne: id }, email, deletedAt: { $exists: false } });
      if (dup) throw new AppError("Email informado já está em uso", 400);
      payload.email = email;
    }
    if (payload.name !== undefined && payload.name.trim().length < 6) {
      throw new AppError("Insira o teu nome completo", 400);
    }
    if (payload.cpf !== undefined) {
      if (!/^\d{11}$/.test(String(payload.cpf).replace(/\D/g, ""))) throw new AppError("CPF informado já está em uso", 400);
      const dup = await PreRegistrationModel.findOne({ _id: { $ne: id }, cpf: payload.cpf, deletedAt: { $exists: false } });
      if (dup) throw new AppError("CPF informado já está em uso", 400);
    }
    if (payload.genre !== undefined && !["H", "M", "O"].includes(payload.genre)) {
      throw new AppError("Selecione um gênero", 400);
    }
    if (payload.password !== undefined && payload.password.length < 6) {
      throw new AppError("Insira password com pelo menos 6 caracteres", 400);
    }

    const appversion = headers.appversion;
    if (appversion) payload.appversion = appversion;
    if (payload.os) { payload.operationalSystem = payload.os; delete payload.os; }

    await PreRegistrationModel.updateOne({ _id: id }, payload);
    return current;
  }
}

export default new PreRegisterService();
