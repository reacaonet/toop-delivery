import {Request, Response} from 'express';

/** Service */
import {apiPagarMe} from '../../services/PagarMe/api';

import validatePost from '../../validators/PagarMe/card';

/**
 * @param {any} req
 * @param {any} res
 * @return {any} {id}
*/
const saveCard = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      CardNumber,
      ExpirationDate,
      SecurityCode,
      Holder,
    } = req.body;

    const isMessage = validatePost({
      CardNumber,
      ExpirationDate,
      SecurityCode,
      Holder,
    });

    if (isMessage !== true) {
      return res.status(400).send({
        message: 'Failed to send data',
        data: isMessage,
      });
    }

    const {data: respPagarMe} = await apiPagarMe.post(`/cards`, {
      'card_number': `${CardNumber}`,
      'card_expiration_date': `${ExpirationDate}`.replace('/', ''),
      'card_cvv': `${SecurityCode}`,
      'card_holder_name': `${Holder}`,
    });

    return res.status(200).send({
      status: true,
      data: respPagarMe,
    });
  } catch (err) {
    let errPayload = null;
    if (err.response && err.response.data) {
      errPayload = err.response.data;
    } else {
      errPayload = err.message;
    }

    return res.status(400).send({
      status: false,
      message: 'Fail list card',
      data: errPayload,
    });
  }
};

export default saveCard;
