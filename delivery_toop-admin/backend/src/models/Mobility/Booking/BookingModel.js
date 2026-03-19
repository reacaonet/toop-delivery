const { Schema, model } = require("mongoose");

const PointSchema = require("../../utils/PointSchema");

const schema = new Schema(
  {
    passenger: {
      type: Schema.Types.ObjectId,
      ref: "Passenger",
      required: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: false,
    },
    franchise: {
      type: Schema.Types.ObjectId,
      ref: "Franchise",
      required: false,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "company",
      required: false,
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: "PaymentDriver",
      required: true,
    },
    directPayment: {
      // novas formas de pagamento direta para o motorista
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    priceToPaid: {
      type: Number,
      required: false,
    },
    tagCost: {
      // preço do pedágio
      type: Number,
      default: 0,
      required: false,
    },
    priceDiscountVoucher: {
      type: Number,
      default: 0,
      required: false,
    },
    origin: {
      type: PointSchema,
      index: "2dsphere",
      required: true,
    },
    destiny: {
      type: [PointSchema],
      index: "2dsphere",
      required: true,
    },
    additionalStops: {
      type: [PointSchema],
      index: "2dsphere",
      required: false,
    },
    historyChangeRoute: {
      type: [Schema.Types.Mixed],
      required: false,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    notifiedDrivers: {
      // Motoristas Notificados
      type: [Schema.Types.ObjectId],
      ref: "Driver",
      required: false,
    },
    notNotifiedDrivers: {
      // Não enviar Notificação para os motoristas
      type: [Schema.Types.ObjectId],
      ref: "Driver",
      required: false,
    },
    refused: {
      // Recusado pelo motorista não enviar a solicitação novamente
      type: [Schema.Types.ObjectId],
      required: false,
    },
    // Utilizado para  não procurar corrido durante um determinado tempo
    lastQueue: {
      type: Date,
      required: false,
    },
    status: {
      type: String,
      enum: ["waiting_pix", "waiting", "accepted", "in_progress", "concluded", "canceled", "driver_not_found", "scheduled"],
      default: "waiting",
      required: true,
    },
    reason: {
      type: String,
      required: false,
    },
    raceToDriver: {
      // corrida exclusiva para motorista
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: false,
    },
    // Tempo estimado de viagem
    routeTime: {
      type: String,
      required: false,
    },
    distance: {
      // Distância estimada da viagem
      type: String,
      required: false,
    },
    arrivedLocal: {
      // Motorista chegou no local de embarque
      type: Boolean,
      required: true,
      default: false,
    },
    arrivedStops: {
      // Motorista chegou na parada adicional
      type: Number,
      required: false,
      default: 0,
    },
    pixQRCode: {
      type: String,
      required: false,
    },
    dataLimitPixPayment: {
      type: Date,
      required: false,
    },
    marker: {
      type: String,
      required: false,
    },
    code: {
      type: String,
      required: false,
    },
    historicAction: {
      // histórico de ação [CHEGAR NO LOCAL | INICIAR VIAGEM | FINALIZAR VIAGEM]
      type: Schema.Types.Mixed,
      required: false,
    },
    startRaceAt: {
      type: Date,
      required: false,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ status: -1 });
schema.index({ passenger: -1 });
schema.index({ franchise: -1 });
schema.index({ driver: -1 });
schema.index({ payment: -1 });
schema.index({ service: -1 });
schema.index({ lastQueue: -1 });
schema.index({ status: -1 });
schema.index({ code: -1 });
schema.index({ createdAt: -1 });
schema.index({ startRaceAt: -1 });
schema.index({ client: -1 });

const BookingModel = model("Booking", schema, "booking");
module.exports = BookingModel;
