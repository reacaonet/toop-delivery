import validator from 'validator';

const validateCustomer = (post: string): string | boolean => {
  const CustomerName = post;

  if (!validator.isLength(`${CustomerName}`, {min: 5, max: 50})) {
    return 'Enter the valid Name';
  }

  return true;
};

export default validateCustomer;
