import {Request, Response} from 'express';
import {apiPagarMe} from '../../../services/PagarMe/api';

// eslint-disable-next-line max-len
const updateRecipient = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const {recipientId} = req.params;

    const dataPayload = req.body;

    console.log('OKK update', recipientId, dataPayload);

    // https://api.pagar.me/1/recipients/recipient_id
    const {data: respPagarMe} = await apiPagarMe.put(
      `/recipients/${recipientId}`,
      dataPayload,
    );

    return res.send({
      status: true,
      data: respPagarMe,
    });
  } catch (e) {
    let errorMessage = e;
    if (e.response && e.response.data && e.response.data.errors) {
      console.log('errorororororoo', e.response.data);
      errorMessage = e.response.data.errors;
    }

    return res.status(400).send({
      status: false,
      error: errorMessage,
    });
  }
};

export default updateRecipient;
