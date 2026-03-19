import validator from 'validator';

const validatePost = (post: TypeValidatePost): string | boolean => {
  /**
    Name Texto 255 Sim Nome do Comprador.
    CardNumber Texto 16 Sim Número do Cartão do Comprador.
    Holder Texto 25 Sim Nome do Comprador impresso no cartão.
    ExpirationDate Texto 7 Sim Data de validade impresso no cartão.
    Brand Texto 10 Sim Bandeira do cartão (Visa / Master / Amex / Elo
    / Aura / JCB / Diners / Discover).
  **/

  const {CardNumber, ExpirationDate, SecurityCode, Holder} = post;
  if (!CardNumber || !validator.isLength(`${CardNumber}`, {min: 16, max: 16})) {
    return 'Enter the Number printed on the Card';
  }

  if (
    !ExpirationDate ||
    !validator.isLength(`${ExpirationDate}`, {min: 5, max: 5})) {
    return 'Enter the Expiration Date';
  }

  if (
    !SecurityCode || !validator.isLength(`${SecurityCode}`, {min: 3, max: 4})) {
    return 'Enter the SecurityCode';
  }

  if (!Holder || !validator.isLength(`${Holder}`, {min: 4, max: 25})) {
    return 'Enter the Holder printed on the Card';
  }

  return true;
};

export default validatePost;


export type TypeValidatePost = {
  CardNumber: string;
  ExpirationDate: string;
  SecurityCode: string;
  Holder: string;
};
