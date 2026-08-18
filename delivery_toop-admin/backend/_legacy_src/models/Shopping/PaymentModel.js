const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    iugu_id: {
      // ID DO PAGAMENTO NA IUGU PAGAMENTOS
      type: String,
      required: false,
    },
    customer: {
      type: mongoose.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    coupon: {
      type: mongoose.Types.ObjectId,
      ref: "Coupon",
      required: false,
    },
    couponPrice: {
      type: Number,
      required: false,
    },
    shoppingCart: {
      type: mongoose.Types.ObjectId,
      ref: "ShoppingCart",
      required: true,
    },
    company: {
      type: mongoose.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    totalCompany: {
      type: Number,
      required: true,
    },
    priceDelivery: {
      type: Number,
      required: true,
    },
    freeShippingBonus: {
      type: Number, //define se teve bonus sob o valor do frete
      required: false,
      default: 0,
    },
    freeShippingBonusOrigin: {
      type: String, //define quem deu o bonus sob o valor do frete
      required: false,
    },
    shippingInfo: {
      type: mongoose.SchemaTypes.Mixed, //valor de compra para receber frete grátis
      required: false,
    },
    debitPrice: {
      type: Number,
      required: false,
    },
    fee: {
      type: Number,
      default: 0,
      required: false,
    },
    feeDebitPrice: {
      type: Number,
      required: false,
    },
    debitPriceAdm: {
      type: Number,
      default: 0,
      required: false,
    },
    feeAdm: {
      type: Number,
      default: 0,
      required: false,
    },
    priceFreight: {
      // valor devido da company ao utilizar frete pago
      type: Number,
      required: false,
    },
    serviceCharge: {
      type: Number,
      required: true,
    },
    partialChargeback: {
      type: Number,
      required: false,
    },
    partialChargebackPayload: {
      type: mongoose.SchemaTypes.Mixed,
      required: false,
    },
    deliveryAddress: {
      type: mongoose.Types.ObjectId,
      ref: "CustomerDeliveryAddress",
      required: true,
    },
    provider: {
      type: String,
      required: false,
    },
    paymentProviderId: {
      type: String,
      required: false,
    },
    payload: {
      type: mongoose.SchemaTypes.Mixed,
      required: false,
    },
    statusPayload: {
      type: String,
      required: false,
    },
    braspagNotification: {
      type: [mongoose.SchemaType.Mixed],
      required: false,
    },
    statusNotification: {
      type: [mongoose.SchemaType.Mixed],
      required: false,
    },
    capture: {
      type: Boolean,
      default: false,
      required: true,
    },
    tip: {
      type: mongoose.SchemaTypes.Mixed,
      required: false,
    },
    valueTip: {
      type: Number,
      required: false,
    },
    typePayment: {
      type: String,
      enum: ["MONEY", "CARD", "BRASPAG", "PAGARME", "PIX", "PIX_DIRECT", "IUGU"],
      required: true,
      default: "BRASPAG",
    },
    typePaymentId: {
      // Forma de Pagamento CARD via Estabelecimento
      type: mongoose.Types.ObjectId,
      ref: "FncTypePayments",
      required: false,
    },
    cashChange: {
      // Forma de Pagamento em Dinheiro - troco
      type: Number,
      required: false,
    },
    usedCashback: {
      // caso seja usado o cashback como parte do pagamento
      type: Number,
      required: false,
      default: null,
    },
    status: {
      type: String,
      enum: ["AWAITING_PAYMENT", "APPROVED", "CANCELED", "REFUSED", "CHARGEBACK"],
      required: true,
      default: "AWAITING_PAYMENT",
    },
    order: {
      type: mongoose.Types.ObjectId,
      required: false,
      ref: "OrderStatus",
    },
    shoppingPaymentMethod: {
      type: mongoose.Types.ObjectId,
      required: false,
      ref: "ShoppingPaymentMethod",
    },
    franchisePaid: {
      type: Boolean,
      default: false,
      required: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    singleDelivery: {
      type: Boolean,
      default: false,
      required: false,
    },
    franchise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: false,
    },
    deliveryFree: {
      type: Boolean,
      default: false,
      required: false,
    },
    typeSchedule: {
      type: String,
      enum: ["DELIVERY", "WITHDRAWAL"],
      default: "DELIVERY",
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "payment",
  },
);

schema.index({ customer: -1 });
schema.index({ shoppingCart: -1 });
schema.index({ paymentProviderId: -1 });
schema.index({ createdAt: -1 });
schema.index({ status: -1 });
schema.index({ shoppingPaymentMethod: -1 });
schema.index({ typePaymentId: -1 });

module.exports = mongoose.model("Payments", schema, "payment");
