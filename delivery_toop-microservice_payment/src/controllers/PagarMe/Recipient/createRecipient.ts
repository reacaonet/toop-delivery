import {Request, Response} from 'express';
import {apiPagarMe} from '../../../services/PagarMe/api';

// eslint-disable-next-line max-len
const createRecipient = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const dataPayload = req.body;

    console.log('OKK create', dataPayload);

    const {data: respPagarMe} = await apiPagarMe.post(
      `/recipients`,
      dataPayload,
    );

    console.log('errro', respPagarMe);

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

export default createRecipient;
