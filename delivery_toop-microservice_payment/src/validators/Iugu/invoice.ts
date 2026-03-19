/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/class-name-casing */

const validatePost = (post: iPayloadStore): string | boolean => {
  // if (!post.order_id) {
  //   return 'Enter the order_id';
  // }

  // if (!post.customer_id) {
  //   return 'Enter the customer_id';
  // }

  if (!post.due_date) {
    return 'Enter the due_date';
  }

  if (!post.items || post.items.length <= 0) {
    return 'Enter of items';
  }

  if (!post.payable_with) {
    return 'Enter the payable_with';
  }

  if (!post.payable_with) {
    return 'Enter the payable_with';
  }

  if (!post.payer) {
    return 'Enter the payer object';
  }

  if (
    post.payable_with !== 'pix' &&
    (!post.payer.cpf_cnpj || !post.payer.name)
  ) {
    return 'for card invoices you need the name and CPF of the payer';
  }

  // if (
  //   post.payable_with === 'credit_card' &&
  //   !post.customer_payment_method_id &&
  //   !post.token
  // ) {
  //   return 'Enter the customer_payment_method_id of the payer';
  // }

  if (post.payable_with === 'pix' && !post.payer.name) {
    return 'Enter the payer name';
  }

  return true;
};

export default validatePost;

interface iPayloadStoreItems {
  description: string;
  quantity: number;
  price_cents: number;
}

interface iPayloadCustomVariables {
  value: any;
  name: string;
}

interface iPayloadStorePayer {
  cpf_cnpj: string;
  name: string;
  email?: string;
  phone_prefix?: string;
  phone?: string;
  address?: {
    zip_code: string;
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    country: string;
    complement?: string;
  };
}

interface iPayloadStore {
  order_id: string;
  customer_id: string;
  payment_id?: string;
  customer_payment_method_id?: string;
  token?: string;
  email: string;
  due_date: string;
  items: iPayloadStoreItems[];
  payable_with: 'credit_card' | 'bank_slip' | 'pix';
  payer: iPayloadStorePayer;
  custom_variables?: iPayloadCustomVariables[];
  splits?: any[];
}
