import {Request, Response} from 'express';

/** Service */
import {apiPagarMe} from '../../services/PagarMe/api';

const getCard = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {cardId} = req.params;

    const {data: respPagarMe} = await apiPagarMe.get(`/cards/${cardId}`);

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

export default getCard;
