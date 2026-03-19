import {Request, Response} from 'express';
/** Service */
import {apiPagarMe} from '../../services/PagarMe/api';

const getTransaction = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const {id} = req.params;
    const {data: respPagarMe} = await apiPagarMe.get(`/transactions/${id}`);

    if (!respPagarMe || !respPagarMe.id) {
      return res.status(400).send({
        message: 'Transação não encontrada',
      });
    }

    return res.status(200).send(respPagarMe);
  } catch (err) {
    return res.status(400).send({
      message: 'Não foi possível verificar transação informada',
    });
  }
};

export default getTransaction;
