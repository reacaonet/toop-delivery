import {Request, Response} from 'express';
// import Invoice from '../../models/InvoiceModel';
import InvoicePostgre from '../../models/Invoice';
import validatePost from '../../validators/Invoice';

const CreateController =
async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = req.body;
    const isMessage = validatePost(data);

    if (isMessage !== true) {
      return res.status(400).json({
        message: 'Failed to send data',
        data: isMessage,
      });
    }

    const invoice = await InvoicePostgre.create(data);
    return res.status(200).json(invoice);
  } catch (err) {
    return res.status(400).json({
      message: 'Fail Create Invoice',
      data: err.message,
    });
  }
};

export default CreateController;
