import mongoose, {Schema} from 'mongoose';

const schema: Schema = new mongoose.Schema({
  payment: {
    type: mongoose.Types.ObjectId,
    ref: 'Payment',
    required: true,
  },
  payload: {
    type: mongoose.SchemaTypes.Mixed,
    required: true,
  },
  attempt: {
    type: Number,
    default: 0,
    required: true,
  },
  status: {
    type: String,
    enum: ['WAIT', 'PROCESS', 'FINISH', 'ERROR'],
    default: 'WAIT',
    required: true,
  },
  phase: {
    type: String,
    enum: [
      'PAID_ORDER',
      'COMPANY',
      'DELIVERYMAN',
      'CHARGEBACK',
      'FINISHED',
      'DISPATCH',
    ],
    default: 'PAID_ORDER',
    required: true,
  },
  paymentDate: {
    type: Date,
    required: false,
  },
  error: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
}, {
  timestamps: true,
  collection: 'queueSplit',
},
);

schema.index({payment: 1});
schema.index({attempt: 1});
schema.index({status: -1});
schema.index({phase: -1});


export default mongoose.model('QueueSplit', schema, 'queueSplit');
