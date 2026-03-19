import {Request, Response} from 'express';
import Invoice from '../../models/Invoice'; // PostgreSQL

import apiEconomizeBr from '../../services/apiEconomizeBr';

const upController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const listInvoice = await Invoice.findAll({
      where: {
        paymentDate: null,
      },
    });

    if (Object.keys(listInvoice).length <= 0) {
      return res.status(200).send({
        message: 'Nenhuma informação encontrada ...',
      });
    }

    for await (const item of listInvoice) {
      try {
        const invoice: any = item;
        const {data: paymentResponse} =
          await apiEconomizeBr.get(`/payment/${invoice.payment}?order=true`);

        let createdAt = invoice.createdAt;
        if (paymentResponse && paymentResponse._id) {
          createdAt = paymentResponse.createdAt;
        }

        await Invoice.update({paymentDate: createdAt}, {
          where: {
            id: invoice.id,
          },
        });
      } catch (err) {
        console.log('Falhou ao atualizar invoice', err);
      }
    }

    return res.status(200).send({
      message: 'Processo Finalizado',
    });
  } catch (err) {
    return res.status(400).json({
      message: 'Fail up Invoice',
      data: err.message,
    });
  }
};

export default upController;
