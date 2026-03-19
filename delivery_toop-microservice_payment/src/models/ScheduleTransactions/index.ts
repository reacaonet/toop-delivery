/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-empty-interface */
import {DataTypes} from 'sequelize';

import {getSequelize} from '../../database/Postgres';
import TransactionsInstance from './types';

const sequelize = getSequelize();
const Transactions = sequelize.define<TransactionsInstance>(
  'Transactions',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    PaymentId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CapturedDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    MerchantId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Nsu: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    AuthorizationCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    AuthorizationDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Status: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    StatusDescription: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CardNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    OrderId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Schedules: {
      type: DataTypes.STRING(100000),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    modelName: 'Transactions',
  },
);

export default Transactions;
