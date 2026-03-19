/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-empty-interface */
import {DataTypes} from 'sequelize';

import {getSequelize} from '../../database/Postgres';

const sequelize = getSequelize();

const Invoice = sequelize.define(
  'Invoices',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    payment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    order: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ownerPerson: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ownerCompany: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    person: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shoppingCart: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    totalPayment: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    typeInvoice: {
      type: DataTypes.ENUM({values: ['INPUT', 'OUTPUT']}),
      allowNull: false,
    },
    statusInvoice: {
      type: DataTypes.ENUM({values: ['WAITING', 'CONFIRMED']}),
      allowNull: false,
    },
    paymentMethodCompany: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
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
    modelName: 'Invoice',
  },
);

export default Invoice;
