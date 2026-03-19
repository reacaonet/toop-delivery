import validator from 'validator';

const merchantOrderId = (post: string): string | boolean => {
  const MerchantOrderId = post;

  if (!validator.isLength(`${MerchantOrderId}`, {min: 1, max: 50})) {
    return 'Enter the valid order id';
  }

  return true;
};

export default merchantOrderId;
