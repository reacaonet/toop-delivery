/* eslint-disable new-cap */
import moment from 'moment';
import mongoose from 'mongoose';
import {Request, Response} from 'express';
import Invoice from '../../models/InvoiceModel';

const ReceivableController =
async (req: Request, res: Response): Promise<Response> => {
  try {
    const aggregate = [];
    const aggregateOut = [];
    const matchInput: any = {};
    const matchOut: any = {};
    const {
      company, person, initialDate, finalDate, statusInvoice,
    }: any = req.query;

    if (!company && !person) {
      return res.status(400).json({
        message: 'inform one company or person',
      });
    }

    if (company && person) {
      console.log('sdfdsf');
      return res.status(400).json({
        message: 'inform one company or person',
      });
    }

    if (company) {
      matchInput.ownerCompany = mongoose.Types.ObjectId(company);
      matchOut.ownerCompany = mongoose.Types.ObjectId(company);
    }

    if (person) {
      matchInput.ownerPerson = mongoose.Types.ObjectId(person);
      matchOut.ownerPerson = mongoose.Types.ObjectId(person);
    }

    if ((initialDate || finalDate) &&
      (
        !moment(initialDate, 'YYYY-MM-DD').isValid() ||
        !moment(finalDate, 'YYYY-MM-DD').isValid()
      )
    ) {
      return res.status(400).json({
        message: 'inform initialDate and finalDate valid',
      });
    }

    if (initialDate && finalDate &&
      moment(initialDate).isValid() &&
      moment(finalDate).isValid()
    ) {
      matchInput.createdAt = {
        $gte: new Date(moment(initialDate).startOf('day').format()),
        $lte: new Date(moment(finalDate).endOf('day').format()),
      };

      matchOut.createdAt = {
        $gte: new Date(moment(initialDate).startOf('day').format()),
        $lte: new Date(moment(finalDate).endOf('day').format()),
      };
    }

    if (statusInvoice) {
      matchInput.statusInvoice = statusInvoice;
      matchOut.statusInvoice = statusInvoice;
    }

    matchInput.typeInvoice = 'INPUT';
    matchOut.typeInvoice = 'OUTPUT';

    aggregate.push({$match: matchInput});
    aggregateOut.push({$match: matchOut});

    if (company) {
      aggregate.push({
        $group: {
          _id: {company: '$ownerCompany'},
          total: {$sum: '$amount'},
        },
      });

      aggregateOut.push({
        $group: {
          _id: {company: '$ownerCompany'},
          total: {$sum: '$amount'},
        },
      });
    }

    if (person) {
      aggregate.push({
        $group: {
          _id: {person: '$ownerPerson'},
          total: {$sum: '$amount'},
        },
      });

      aggregateOut.push({
        $group: {
          _id: {person: '$ownerPerson'},
          total: {$sum: '$amount'},
        },
      });
    }

    const responseInput: any = await Invoice.aggregate(aggregate);
    const responseOut: any = await Invoice.aggregate(aggregateOut);

    let input = 0;
    let output = 0;

    if (responseInput && responseInput.length > 0 && responseInput[0].total) {
      input = responseInput[0].total;
    }

    if (responseOut && responseOut.length > 0 && responseOut[0].total) {
      output = responseOut[0].total;
    }

    return res.status(200).json({
      input,
      output,
    });
  } catch (err) {
    return res.status(400).json({
      message: 'Fail List Invoice',
      data: err.message,
    });
  }
};

export default ReceivableController;
