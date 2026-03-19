const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    originAccount: {
      //conta que originou a movimentacao
      type: mongoose.Types.ObjectId,
      ref: "Account",
      required: false,
    },
    originAgency: {
      //agencia da conta que originou a movimentacao
      type: mongoose.Types.ObjectId,
      ref: "Agency",
      required: false,
    },
    destinationAccount: {
      //conta a movimentacao foi destinada
      type: mongoose.Types.ObjectId,
      ref: "Account",
      required: false,
    },
    destinationAgency: {
      //agencia conta a movimentacao foi destinada
      type: mongoose.Types.ObjectId,
      ref: "Agency",
      required: false,
    },
    costCenter: {
      //centro e custo
      type: mongoose.Types.ObjectId,
      ref: "CostCenter",
      required: false,
    },
    type: {
      type: String,
      enum: ["debit", "credit", "withdraw", "chargeback", "cashback"],
      required: true,

      //'debit' = -, 'credit': +, 'withdraw': -, 'chargeback': +, 'cashback': +],
    },
    status: {
      type: String,
      required: true,
      default: "AWAITING",
      enum: ["AUTHORIZEDBYUSER", "BANKAUTHORIZED", "COMPLETED", "AWAITING", "SCHEDULED", "CANCELED"],
    },
    value: {
      // valor da transação
      type: Number,
      required: true,
    },
    transactionDate: {
      type: Date,
      required: false,
      default: new Date(),
    },
    transactionCode: {
      type: String,
      required: true,
    },
    description: {
      //descrição da transação
      type: String,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "Transactions",
  },
);

schema.index({ status: "text" });
schema.index({ status: -1 });
schema.index({ transactionDate: "text" });
schema.index({ transactionDate: -1 });

module.exports = mongoose.model("Transactions", schema, "transactions");

/**
 * status
 * 'AuthorizedByUser' = atorizado pelo usuário e aguardando a conclusao
 * 'BankAuthorized' = autorizado pelo banco e aguardando a conclusao
 * 'Completed'= completa/finalizada
 * 'Awaiting' = Aguardando
 * 'Scheduled' = Agendado e aguardando a conclusao
 * 'canceled' = Cancelado
 */
