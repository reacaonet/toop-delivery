const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    passenger: {
      type: Schema.Types.ObjectId,
      ref: "Passenger",
      required: true,
    },
    total: {
      // preço total cobrado para pagamento
      type: Number,
      required: true,
    },
    estimatedTotal: {
      // preço estimado registrado no inicio da viagem
      type: Number,
      required: false,
    },
    priceChanged: {
      type: Boolean,
      default: false,
      required: false,
    },
    // preço total cobrado, após cancelar a viagem
    priceCancellation: {
      type: Number,
      required: false,
    },
    totalAppCredit: {
      type: Number,
      default: 0,
      required: true,
    },
    voucher: {
      type: Schema.Types.ObjectId,
      ref: "VoucherDiscount",
      required: false,
    },
    priceDiscountVoucher: {
      // preço do desconto oferecido (não está somado com o total)
      type: Number,
      default: 0,
      required: false,
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
      type: Schema.Types.Mixed,
      required: false,
    },
    statusPayload: {
      type: String,
      required: false,
    },
    capture: {
      type: Boolean,
      default: false,
      required: true,
    },
    tip: {
      type: Schema.Types.Mixed,
      required: false,
    },
    valueTip: {
      type: Number,
      required: false,
    },
    typePayment: {
      type: String,
      enum: ["MONEY", "CARD", "BRASPAG", "PAGARME", "PIX", "WALLET", "WALLET_PIX", "WALLET_PAGARME", "WALLET_CARD", "WALLET_MONEY", "IUGU"],
      required: true,
      default: "PAGARME",
    },
    status: {
      type: String,
      enum: ["WAITING_PIX", "AWAITING_PAYMENT", "APPROVED", "CANCELED", "REFUSED", "CHARGEBACK"],
      required: true,
      default: "AWAITING_PAYMENT",
    },
    feeAdm: {
      // % taxa do admin cobrado da Franquia *franchise.percentService*
      type: Number,
      required: false,
      default: 0,
    },
    feeAdmValue: {
      // Valor em R$ cobrado pelo Adm *franchise.fixedservicefee*
      type: Number,
      required: false,
      default: 0,
    },
    debitPriceAdm: {
      // valor taxa do admin
      type: Number,
      required: false,
      default: 0,
    },
    feeFranchise: {
      // % taxa da franquia *Service.valueByPercentage*
      type: Number,
      required: false,
      default: 0,
    },
    feeFranchiseValue: {
      // Valor em R$ cobrado pela franquia *Service.fixedValue*
      type: Number,
      required: false,
      default: 0,
    },
    debitPriceFranchise: {
      // valor taxa da franquia em R$ corrente já calculado (feeFranchise + feeFranchiseValue)
      type: Number,
      required: false,
      default: 0,
    },
    transactionCode: {
      // codigo unicio da transação da conta digital
      type: String,
      required: false,
    },
    useWalletBalance: {
      type: Boolean,
      required: false,
    },
    valueWalletBalance: {
      type: Number,
      required: false,
    },
    chargebackPayload: {
      type: Schema.Types.Mixed,
      required: false,
    },
    currencySymbol: {
      // símbolo monetário
      type: String,
      enum: ["R$", "€", "$", "₲", "Kz"],
      default: "R$",
      required: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ passenger: 1 });
schema.index({ paymentProviderId: 1 });
schema.index({ typePayment: -1 });
schema.index({ createdAt: -1 });
schema.index({ deletedAt: 1 });

const PaymentModel = model("PaymentDriver", schema, "paymentDriver");
module.exports = PaymentModel;
