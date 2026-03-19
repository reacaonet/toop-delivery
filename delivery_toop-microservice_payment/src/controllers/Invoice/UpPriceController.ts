import {Request, Response} from 'express';
import Sequelize from 'sequelize';
import Invoice from '../../models/Invoice'; // PostgreSQL
const {not} = Sequelize.Op;
import apiEconomizeBr from '../../services/apiEconomizeBr';

const upPriceController =
async (req: Request, res: Response): Promise<Response> => {
  try {
    const listInvoice = await Invoice.findAll({
      where: {
        ownerCompany: {
          [not]: null,
        },
        company: {
          [not]: null,
        },
      },
    });

    for await (const item of listInvoice) {
      try {
        const invoice: any = item;
        const {data: paymentResponse} =
          await apiEconomizeBr.get(`/payment/${invoice.payment}?order=true`);

        if (paymentResponse && paymentResponse._id) {
          if (invoice.amount !== paymentResponse.totalCompany) {
            await Invoice.update({amount: paymentResponse.totalCompany}, {
              where: {
                id: invoice.id,
              },
            });

            console.log('Alterado ... ', invoice.id);
          }
        }
      } catch (err) {
        console.log('');
      }
    }

    return res.status(200).send({
      message: 'Processo Finalizado',
      listInvoice,
    });
  } catch (err) {
    return res.status(400).json({
      message: 'Fail up Invoice',
      data: err.message,
    });
  }
};

export default upPriceController;
