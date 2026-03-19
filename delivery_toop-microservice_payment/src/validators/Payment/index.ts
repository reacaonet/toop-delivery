import validator from 'validator';
import {TypeValidatePost} from './types';

const validatePost = (post: TypeValidatePost): string | boolean => {
  /**
    Name Texto 255 Sim Nome do Comprador.
    CardNumber Texto 16 Sim Número do Cartão do Comprador.
    Holder Texto 25 Sim Nome do Comprador impresso no cartão.
    ExpirationDate Texto 7 Sim Data de validade impresso no cartão.
    Brand Texto 10 Sim Bandeira do cartão (Visa / Master / Amex / Elo
    / Aura / JCB / Diners / Discover).
  **/

  const {CustomerName, CardNumber, ExpirationDate, Brand, SecurityCode} = post;

  if (!validator.isLength(`${CustomerName}`, {min: 10, max: 50})) {
    return 'Enter the Name printed on the card';
  }

  if (!validator.isLength(`${CardNumber}`, {min: 16, max: 16})) {
    return 'Enter the Number printed on the Card';
  }

  if (!validator.isLength(`${ExpirationDate}`, {min: 7, max: 7})) {
    return 'Enter the Expiration Date';
  }

  if (validator.isEmpty(`${SecurityCode}`)) {
    return 'Enter the SecurityCode';
  }

  if (!Brand) {
    return 'Unidentified Card Flag';
  }

  return true;
};

export default validatePost;
