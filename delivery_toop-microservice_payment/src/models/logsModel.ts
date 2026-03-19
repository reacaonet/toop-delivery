// const mongoose = require('mongoose');

import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    typeSystem: {
      type: String,
      enum: ['MOBILE', 'WEB', 'BACKEND'],
      default: 'BACKEND',
      required: true,
    },
    typeLog: {
      type: String,
      enum: ['WARN', 'ERROR', 'ALERT', 'SUCCESS'],
      default: 'WARN',
      required: true,
    },
    description: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
      default: '',
    },
    category: {
      type: String,
      required: true,
    },
    originError: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: 'log',
  },
);

schema.index({createdAt: -1});
schema.index({typeLog: -1});
schema.index({category: -1});

export default mongoose.model('Log', schema, 'log');
