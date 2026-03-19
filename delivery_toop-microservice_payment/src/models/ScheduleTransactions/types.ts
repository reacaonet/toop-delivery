import {Model, Optional} from 'sequelize';

interface TransactionsAttributes {
  id?: string;
  PaymentId: string;
  CapturedDate: string;
  MerchantId: string;
  Nsu: number;
  AuthorizationCode: string;
  AuthorizationDate: string;
  Status: number;
  StatusDescription: string;
  CardNumber: string;
  OrderId: string;
  Schedules: string;
  createdAt?: string;
  updatedAt?: string;
}
type TransactionsCreationAttributes = Optional<TransactionsAttributes, 'id'>;

interface TransactionsInstance
  extends Model<TransactionsAttributes, TransactionsCreationAttributes>,
    TransactionsAttributes {}

export default TransactionsInstance;
