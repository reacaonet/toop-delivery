import mongoose from "mongoose";
import { PopupModel } from "../models/Popup";
import { PopupViewModel } from "../models/PopupView";
import { IntegrationModel } from "../models/Integration";
import { AppError } from "../middleware/errorHandler";

function normalizeStatus(data: any) {
  const p = { ...data };
  if (p.status === "" || p.status === null || p.status === undefined) p.status = false;
  return p;
}

function asObjectId(v: any, msg: string) {
  if (!mongoose.Types.ObjectId.isValid(v)) throw new AppError(msg, 400);
  return new mongoose.Types.ObjectId(v);
}

function buildImages(data: any) {
  const images: string[] = [];
  if (Array.isArray(data.file)) {
    data.file.forEach((f: any) => { if (f && f.url) images.push(f.url); });
  } else if (data.file && data.file.url) {
    images.push(data.file.url);
  } else if (Array.isArray(data.url)) {
    data.url.forEach((u: any) => { if (u) images.push(u); });
  } else if (data.url) {
    images.push(data.url);
  }
  return images;
}

export class ToolsService {
  // ================= Popup =================
  async listPopup() {
    const filter: any = { deletedAt: { $exists: false } };
    return PopupModel.find(filter).populate("company", "name").sort({ priorities: -1 });
  }

  async paginatorPopup(query: any) {
    const pageIn = parseInt(query.pageIn, 10);
    const pageOut = parseInt(query.pageOut, 10);
    if (!Number.isInteger(pageIn) || !Number.isInteger(pageOut) || pageOut <= 0) {
      throw new AppError("Informe pageIn e pageOut", 400);
    }
    const filter: any = { deletedAt: { $exists: false } };
    if (query.name) filter.name = new RegExp(String(query.name).toLowerCase(), "i");
    const [list, total] = await Promise.all([
      PopupModel.find(filter).populate("company", "name").sort({ createdAt: -1 }).skip(pageIn * pageOut).limit(pageOut),
      PopupModel.countDocuments(filter),
    ]);
    return { list, total };
  }

  async createPopup(data: any) {
    const payload: any = normalizeStatus(data);
    const images = buildImages(data);
    delete payload.file;
    delete payload.image;
    if (images.length > 0) payload.images = images;
    payload.startHour = payload.startHour ?? 0;
    payload.endHour = payload.endHour ?? 2359;
    return PopupModel.create(payload);
  }

  async updatePopup(id: string, data: any) {
    const payload: any = normalizeStatus({ ...data });
    const images = buildImages(data);
    delete payload.file;
    delete payload.image;
    if (images.length > 0) payload.images = images;
    const doc = await PopupModel.findOneAndUpdate({ _id: id }, payload, { upsert: true, new: true }).populate("company", "name");
    if (!doc) throw new AppError("Popup não encontrado", 404);
    return doc;
  }

  async removePopup(id: string) {
    const doc = await PopupModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    if (!doc) throw new AppError("Popup não encontrado", 404);
    return { message: "Popup deletado com sucesso" };
  }

  async updatePopupViews(id: string, body: any) {
    const popupObj = asObjectId(id, "Id do popup inválido");
    const person = asObjectId(body.person, "Informe a pessoa");
    await PopupViewModel.create({ popup: popupObj, person });
    const updated = await PopupModel.findOneAndUpdate(
      { _id: popupObj },
      { $inc: { quantityViews: 1 } },
      { new: true }
    );
    return updated;
  }

  async listPopupApp(personId: string) {
    const person = asObjectId(personId, "Id da pessoa inválido");
    const seen = await PopupViewModel.find({ person }).select("popup");
    const seenIds = seen.map((s) => s.popup as mongoose.Types.ObjectId);
    const now = new Date();
    const filter: any = {
      _id: { $nin: seenIds },
      status: true,
      deletedAt: { $exists: false },
      startDate: { $lte: now },
      endDate: { $gte: now },
      $expr: { $gt: ["$vizualizations", "$quantityViews"] },
    };
    return PopupModel.findOne(filter).sort({ priorities: -1 }).populate("company", "name");
  }

  // ================= Integration =================
  async listIntegrations(query: any) {
    const filter: any = { deletedAt: { $exists: false } };
    if (query.name) {
      const comps = await mongoose.connection.collection("companies").find({ name: new RegExp(String(query.name), "i") }).toArray();
      filter.company = { $in: comps.map((c: any) => c._id) };
    }
    return IntegrationModel.find(filter).populate("company", "name");
  }

  async listIntegrationByCompany(company: string) {
    asObjectId(company, "Empresa inválida");
    return IntegrationModel.findOne({ company }).lean();
  }

  async createIntegration(data: any) {
    return IntegrationModel.create(normalizeStatus(data));
  }

  async updateIntegration(id: string, data: any) {
    const doc = await IntegrationModel.findOneAndUpdate({ _id: id }, normalizeStatus(data), { upsert: true, new: true }).populate("company", "name");
    if (!doc) throw new AppError("Integração não encontrada", 404);
    return doc;
  }

  async removeIntegration(id: string) {
    const doc = await IntegrationModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
    if (!doc) throw new AppError("Integração não encontrada", 404);
    return { message: "Integração deletada com sucesso" };
  }

  async paginatorIntegration(query: any) {
    const pageIn = parseInt(query.pageIn, 10);
    const pageOut = parseInt(query.pageOut, 10);
    if (!Number.isInteger(pageIn) || !Number.isInteger(pageOut) || pageOut <= 0) {
      throw new AppError("Informe pageIn e pageOut", 400);
    }
    const filter: any = { deletedAt: { $exists: false } };
    const [list, total] = await Promise.all([
      IntegrationModel.find(filter).populate("company", "name").sort({ createdAt: -1 }).skip(pageIn * pageOut).limit(pageOut),
      IntegrationModel.countDocuments(filter),
    ]);
    return { list, total };
  }
}

export default new ToolsService();
