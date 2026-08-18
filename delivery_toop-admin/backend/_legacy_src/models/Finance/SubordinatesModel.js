const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  legalPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: false,
  },
  physicalPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Person",
    required: false,
  },
  socialReason: {
    type: String,
    required: false,
  },
  cnpj: {
    type: Number,
    required: false,
  },
  fantasyName: {
    type: String,
    required: false, 
  },
  representativesName: {
    type: String,
    required: false, 
  },
  representativeEmail: {
    type: String,
    required: false, 
  },
  representativePhone: {
    type: Number,
    required: false, 
  },
  name: {
    type: String,
    required: false,
  },
  cpf: {
    type: Number,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  phone: {
    type: Number,
    required: false,
  },
  dateOfBirth: {
    type: Date,
    required: false,
  },
  cep: {
    type: Number,
    required: true,
  },
  publicPlace: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
  complement: {
    type: String,
    required: true,
  },
  neighborhood: {
    type: String,
    required: true,
  },
  uf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SettingState',
    required: true,
   },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SettingCity",
    required: true,
  },
  accountType: {
    type: String,
    enum: ['Conta corrente', 'Conta poupança'],
    required: true,
  },
  bank: {
    type: String,
    required: true,
  },
  agency: {
    type: Number,
    required: true,
  },
  agencyDigit: {
    type: Number,
    required: true,
  },
  account: {
    type: Number,
    required: true,
  },
  accountDigit: {
    type: Number,
    required: true,
  },
  fees: {
    type: String,
    enum: ['NÃO CADASTRAR TAXA', 'TAXA GLOBAL'],
    required: true,
  },
  tariff: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
},  {
  timestamps: true,
  collection: "fncSubordinates"
});

module.exports = mongoose.model('FncSubordinates', schema, 'fnc_subordinates');