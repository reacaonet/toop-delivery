const mongoose = require('mongoose');

const BankShema = mongoose.Schema({
  favoredName: {
    type: String,
    required: false,
  },
  document: {
    type: String,
    required: false,
  },
  documentType: {
    type: String,
    enum: ['CNPJ', 'CPF'],
    required: false,
  },
  brazilianBank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SettingBrazilianBanks",
    required: false,
  },
  bankName: {
    type: String,
    required: false,
  },
  agency: {
    type: String,
    required: false,
  },
  agencyDigit: {
    type: String,
    required: false,
  },
  account: {
    type: String,
    required: false,
  },
  accountDigit: {
    type: String,
    required: false,
  },
  typeAccount: {
    type: String,
    default: 'CURRENT',
    enum: ['CURRENT', 'SAVINGS'],
    required: false,
  },
  pixType: {
    type: String,
    default: 'RANDOMKEY',
    enum: ['CNPJ', 'CPF', 'CELLPHONE', 'EMAIL', 'RANDOMKEY'],
    required: false,
  },
  pixKey: {
    type: String,
    required: false,
  },
});

module.exports = BankShema;
