import {Request, Response} from 'express';
import moment from 'moment';
import QueueSplit from '../../models/QueueSplit';

const CreateController =
async (req: Request, res: Response): Promise<Response> => {
  try {
    const {payment, payload, paymentDate, status, phase} = req.body;
    let date = moment().utc().toDate();

    if (!payment || !payload ) {
      return res.status(400).json({
        message: 'Failed to send data',
      });
    }

    if (paymentDate) {
      date = moment(paymentDate).utc().toDate();
    }

    const add: any = {
      payment,
      payload,
      paymentDate: date,
    };

    if (status) {
      add.status = status;
    }

    if (phase) {
      add.phase = phase;
    }

    // Verifica se já existe
    const current = await QueueSplit.findOne({
      payment: payment,
    }).lean();

    if (current && current._id) {
      return res.status(200).json(current);
    }

    const queue = await QueueSplit.create(add);
    return res.status(200).json(queue);
  } catch (err) {
    return res.status(400).json({
      message: 'Fail Create Invoice',
      data: err.message,
    });
  }
};

export default CreateController;
