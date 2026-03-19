import mongoose, {Schema} from 'mongoose';

const schema: Schema = new mongoose.Schema({
  payment: {
    type: mongoose.Types.ObjectId,
    ref: 'Payment',
    required: true,
  },
  order: {
    type: mongoose.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  ownerPerson: {
    type: mongoose.Types.ObjectId,
    ref: 'Person',
    required: false,
  },
  ownerCompany: {
    type: mongoose.Types.ObjectId,
    ref: 'Company',
    required: false,
  },
  person: {
    type: mongoose.Types.ObjectId,
    ref: 'Person',
    required: false,
  },
  company: {
    type: mongoose.Types.ObjectId,
    ref: 'Company',
    required: false,
  },
  shoppingCart: {
    type: mongoose.Types.ObjectId,
    ref: 'ShoppingCart',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  totalPayment: {
    type: Number,
    required: true,
  },
  typeInvoice: {
    type: String,
    enum: ['INPUT', 'OUTPUT'],
    required: true,
  },
  statusInvoice: {
    type: String,
    enum: ['WAITING', 'CONFIRMED'],
    required: true,
    default: 'WAITING',
  },
  paymentMethodCompany: {
    type: mongoose.Types.ObjectId,
    ref: 'PaymentMethodCompany',
    required: false,
  }}, {
  timestamps: true,
});

schema.index({payment: 1});
schema.index({order: 1});
schema.index({company: 1});
schema.index({person: 1});
schema.index({ownerCompany: 1});
schema.index({ownerPerson: 1});
schema.index({typeInvoice: 1});
schema.index({statusInvoice: 1});

export default mongoose.model('Invoice', schema, 'invoice');
