import { OrderModel } from "../models/Order";
import { UserModel } from "../models/User";
import { ShoppingPaymentMethodModel } from "../models/ShoppingPaymentMethod";
import { SettingsModel } from "../models/Settings";
import { AppError } from "../middleware/errorHandler";
import { incOrder } from "../middleware/metrics";
import walletService from "./wallet.service";
import repasseService from "./repasse.service";
import paymentGatewayService from "./payment-gateway.service";
import { env } from "../config";
import crypto from "crypto";

interface PaginationQuery {
  page?: string;
  limit?: string;
  status?: string;
  company?: string;
  customer?: string;
  startDate?: string;
  endDate?: string;
}

interface PaginatedResult {
  data: any[];
  total: number;
  page: number;
  pages: number;
}

export class OrderService {
  async create(data: {
    company: string;
    customer: string;
    items: Array<{ name: string; quantity: number; price: number; total: number; addons?: Array<{ addonId: string; name: string; price: number }> }>;
    subtotal: number;
    deliveryFee?: number;
    discount?: number;
    tip?: number;
    total: number;
    paymentMethod: string;
    paymentMethodId?: string;
    deliveryAddress: {
      street?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      lat?: number;
      lng?: number;
    };
    notes?: string;
  }) {
    const deliveryFee = Math.max(0, Number(data.deliveryFee || 0));
    const discount = Math.max(0, Number(data.discount || 0));
    const tip = Math.max(0, Number(data.tip || 0));

    const computedSubtotal =
      Math.round(data.items.reduce((sum, item) => sum + Number(item.total || 0), 0) * 100) / 100;
    if (Math.abs(computedSubtotal - Number(data.subtotal || 0)) > 0.01) {
      throw new AppError("Subtotal inconsistente com os itens do pedido", 400);
    }

    const computedTotal = Math.round((computedSubtotal + deliveryFee - discount) * 100) / 100;
    if (Math.abs(computedTotal - Number(data.total || 0)) > 0.01) {
      throw new AppError("Total inconsistente com o subtotal, frete e desconto", 400);
    }

    const orderNumber = `${Date.now()}${crypto.randomInt(1000).toString().padStart(3, "0")}`;
    const method = String(data.paymentMethod || "").toLowerCase();
    const amountCents = Math.round(Number(data.total) * 100);

    let paymentStatus: "pending" | "paid" | "failed" | "refunded" =
      method === "cash" || method === "money" ? "paid" : "pending";
    let pixTxid: string | undefined;
    let pixQrcode: string | undefined;
    let gatewayResult: any;

    if (method === "credit_card" || method === "debit_card") {
      if (!data.paymentMethodId) {
        throw new AppError("Selecione um cartão salvo para pagar", 400);
      }

      const card = await ShoppingPaymentMethodModel.findOne({
        _id: data.paymentMethodId,
        customer: data.customer,
        isDeleted: { $ne: true },
      });
      if (!card) {
        throw new AppError("Cartão de pagamento não encontrado", 404);
      }

      const user = await UserModel.findById(data.customer).lean();
      const name = user?.name || card.nameOnCard;
      const email = user?.email || "";
      const phone = user?.phone;
      const phoneNumbers = phone
        ? (() => {
            const digits = String(phone).replace(/\D/g, "");
            return [digits.length < 11 ? `+55${digits}` : `+${digits}`];
          })()
        : undefined;

      gatewayResult = await paymentGatewayService.pagarmeTransaction({
        reference_key: orderNumber,
        amount: amountCents,
        card_id: card.cardToken,
        card_cvv: card.verifierCode,
        payment_method: method,
        postback_url: `${env.PAYMENT_URL.replace(/\/$/, "")}/pagar-me/driver/status`,
        async: false,
        installments: 1,
        capture: true,
        soft_descriptor: "GoJa",
        customer: {
          external_id: data.customer,
          name,
          email,
          country: "br",
          type: "individual",
          documents: [
            {
              type: card.documentType.toLowerCase(),
              number: card.document,
            },
          ],
          ...(phoneNumbers ? { phone_numbers: phoneNumbers } : {}),
        },
        billing: {
          name,
          address: {
            country: "br",
            state: data.deliveryAddress?.state || "",
            city: data.deliveryAddress?.city || "",
            neighborhood: data.deliveryAddress?.neighborhood || "",
            street: (data.deliveryAddress?.street || "").substring(0, 35),
            street_number: data.deliveryAddress?.number || "1",
            zipcode: (data.deliveryAddress?.zipCode || "").replace(/\D/g, ""),
          },
        },
      });
      paymentStatus = "paid";
    }

    if (method === "pix") {
      gatewayResult = await paymentGatewayService.pixCharge({ amount: amountCents });
      const unwrapped: any =
        gatewayResult?.data && typeof gatewayResult.data === "object" ? gatewayResult.data : gatewayResult;
      const txid = String(unwrapped?.txid || unwrapped?.id || unwrapped?.transaction_id || "");
      const qrcode = String(
        unwrapped?.pix_qr_code || unwrapped?.qrcode || unwrapped?.qr_code || unwrapped?.emv || ""
      );
      if (!txid && !qrcode) {
        throw new AppError("O gateway não retornou txid/qrcode para o PIX", 400);
      }
      pixTxid = txid || undefined;
      pixQrcode = qrcode || undefined;
      paymentStatus = "pending";
    }

    const order = await OrderModel.create({
      ...data,
      paymentMethodId: data.paymentMethodId,
      paymentStatus,
      pixTxid,
      pixQrcode,
      tip,
      orderNumber,
      status: "pending",
    });

    incOrder("created");

    if (gatewayResult) {
      const unwrapped: any =
        gatewayResult?.data && typeof gatewayResult.data === "object" ? gatewayResult.data : gatewayResult;
      await paymentGatewayService.record({
        gateway: method === "pix" ? "PIX" : "PAGARME",
        operation: method === "pix" ? "pix_charge" : "charge",
        method: method === "pix" ? "pix" : method,
        amount: Number(data.total),
        fees: 0,
        status: method === "pix" ? "processing" : "succeeded",
        gatewayId: String(unwrapped?.id || (method === "pix" ? pixTxid : "") || ""),
        gatewayResponse: gatewayResult,
        order: order._id.toString(),
        customer: data.customer,
        company: data.company,
      });
    }

    return order;
  }

  async getById(id: string) {
    const order = await OrderModel.findById(id).populate("company").populate("customer").populate("deliveryman");
    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }
    return order;
  }

  async list(query: PaginationQuery): Promise<PaginatedResult> {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.company) {
      filter.company = query.company;
    }

    if (query.customer) {
      filter.customer = query.customer;
    }

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) {
        const start = new Date(query.startDate);
        if (!isNaN(start.getTime())) filter.createdAt.$gte = start;
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        if (!isNaN(end.getTime())) filter.createdAt.$lte = end;
      }
      if (Object.keys(filter.createdAt).length === 0) delete filter.createdAt;
    }

    const [data, total] = await Promise.all([
      OrderModel.find(filter)
        .populate("company")
        .populate("customer")
        .populate("deliveryman")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      OrderModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async updateStatus(id: string, status: string, deliverymanId?: string) {
    const order = await OrderModel.findById(id);
    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }

    const wasDelivering = order.status === "delivering";

    const allowedTransitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["preparing", "cancelled"],
      preparing: ["ready", "cancelled"],
      ready: ["delivering", "cancelled"],
      delivering: ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
    };

    const allowed = allowedTransitions[order.status] || [];
    if (!allowed.includes(status)) {
      throw new AppError(
        `Transição de status inválida: ${order.status} → ${status}`,
        400
      );
    }

    const updateData: any = { status };

    if (status === "delivering") {
      if (!deliverymanId) {
        throw new AppError("deliverymanId é obrigatório ao aceitar entrega", 400);
      }
      updateData.deliveryman = deliverymanId;
    }

    if (status === "delivered") {
      updateData.deliveredAt = new Date();
    }

    const updated = await OrderModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (status === "delivered" && wasDelivering && updated) {
      await this.creditDeliverymanWallet(updated);
      await repasseService.recordRepasse(updated);
    }

    if (status === "delivered") incOrder("completed");
    else if (status === "cancelled") incOrder("cancelled");

    return updated;
  }

  private async creditDeliverymanWallet(order: InstanceType<typeof OrderModel>) {
    const deliverymanId = order.deliveryman;
    const fee = Number(order.deliveryFee || 0);
    if (!deliverymanId || fee <= 0) return;

    try {
      const settings = await SettingsModel.findOne().lean();
      const feePct = settings?.deliverymanFeePercentage ?? 2;
      const earning = Math.round(fee * (1 - feePct / 100) * 100) / 100;
      if (earning > 0) {
        await walletService.credit(
          deliverymanId.toString(),
          earning,
          `Entrega #${order.orderNumber} - taxa de entrega`
        );
      }
    } catch (err) {
      console.error("[Order] Erro ao creditar carteira do entregador:", err);
    }
  }

  async acceptOrder(orderId: string, deliverymanId: string) {
    const order = await OrderModel.findOneAndUpdate(
      { _id: orderId, status: 'ready', deliveryman: null },
      { $set: { status: 'delivering', deliveryman: deliverymanId } },
      { new: true }
    );

    if (!order) {
      throw new AppError("Pedido não está mais disponível para entrega", 400);
    }

    return order;
  }

  async cancel(id: string) {
    const order = await OrderModel.findById(id);

    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }

    if (order.status === "cancelled") {
      throw new AppError("Pedido já está cancelado", 400);
    }

    if (order.status === "delivered") {
      throw new AppError("Não é possível cancelar pedido já entregue", 400);
    }

    order.status = "cancelled";
    await order.save();

    incOrder("cancelled");

    return order;
  }
}

export default new OrderService();
