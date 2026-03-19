import mongoose, {Schema} from 'mongoose';

const schema: Schema = new mongoose.Schema({
  customer: {
    type: mongoose.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  isMain: {
    type: Boolean,
    default: false,
    required: true,
  },
  flag: {
    type: String,
    enum: [
      'AMEX',
      'DINERS',
      'DISCOVER',
      'ELO',
      'MASTERCARD',
      'MASTER',
      'MAESTRO',
      'VISA',
      'OTHERS',
    ],
    required: true,
  },
  cartNumber: {
    type: String,
    required: true,
  },
  nameOnCard: {
    type: String,
    required: true,
  },
  valid: {
    type: Date,
    required: true,
  },
  documentType: {
    type: String,
    enum: ['CPF', 'PASSPORT'],
    required: true,
  },
  document: {
    type: String,
    required: true,
  },
  cardToken: {
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  collection: 'card',
});

export default mongoose.model('Card', schema, 'card');
