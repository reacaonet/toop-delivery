export type TypeValidatePost = {
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
};
