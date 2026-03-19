import validator from 'validator';
import {TypeValidatePayment} from './types';

const validatePayment = (post: TypeValidatePayment): string | boolean => {
  const Payment = post;

  if (
    validator.isEmpty(Payment.Type) ||
    validator.isEmpty(Payment.FraudAnalysis.Provider) ||
    validator.isEmpty(Payment.SoftDescriptor)
  ) {
    return 'No information can be blank';
  }

  if (Payment.Amount === 0) {
    return 'Enter the valid Amount';
  }

  if (Payment.FraudAnalysis.TotalOrderAmount === 0) {
    return 'Enter the valid TotalOrderAmount';
  }

  if (Payment.Installments === 0) {
    return 'Enter the valid Installments';
  }

  return true;
};

export default validatePayment;
