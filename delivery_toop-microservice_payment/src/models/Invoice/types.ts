import {Model, Optional} from 'sequelize';

interface InvoiceAttributes {
  id?: string;
  payment: string;
  order: string;
  ownerPerson?: string;
  ownerCompany?: string;
  person?: string;
  company?: string;
  shoppingCart: string;
  amount: number;
  totalPayment: number;
  typeInvoice: string;
  statusInvoice: string;
  paymentMethodCompany?: string;
  paymentDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

type InvoiceCreationAttributes = Optional<InvoiceAttributes, 'id'>;


interface InvoiceInstance
  extends Model<InvoiceAttributes, InvoiceCreationAttributes>,
  InvoiceAttributes {}

export default InvoiceInstance;
