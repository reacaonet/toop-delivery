import validator from 'validator';
import mongoose from 'mongoose';
import {TypeValidatePost} from './types';

const validatePost = (post: TypeValidatePost): string | boolean => {
  const {
    payment,
    order,
    ownerPerson,
    ownerCompany,
    person,
    company,
    shoppingCart,
    amount,
    totalPayment,
    typeInvoice,
    // paymentMethodCompany,
  } = post;

  if (!mongoose.Types.ObjectId.isValid(payment)) {
    return 'Enter the payment';
  }

  if (!mongoose.Types.ObjectId.isValid(order)) {
    return 'Enter the order';
  }

  if (!mongoose.Types.ObjectId.isValid(shoppingCart)) {
    return 'Enter the shoppingCart';
  }

  if (!amount || !validator.isNumeric(`${amount}`) ) {
    return 'Enter amount valid';
  }

  if (!totalPayment || !validator.isNumeric(`${totalPayment}`) ) {
    return 'Enter totalPayment valid';
  }

  if (!typeInvoice || (typeInvoice !== 'INPUT' && typeInvoice !== 'OUTPUT')) {
    return 'Enter typeInvoice valid';
  }

  // if (!mongoose.Types.ObjectId.isValid(paymentMethodCompany)) {
  //   return 'Enter the paymentMethodCompany';
  // }

  if (!ownerPerson && !ownerCompany) {
    return 'inform one owner';
  }

  if (ownerPerson && ownerCompany) {
    return 'report just one owner';
  }

  if (!person && !company) {
    return 'inform one person or company';
  }

  if (person && company) {
    return 'inform only person or company';
  }

  return true;
};

export default validatePost;
