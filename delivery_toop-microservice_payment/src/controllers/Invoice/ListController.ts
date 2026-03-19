/* eslint-disable new-cap */
import {Request, Response} from 'express';
import Invoice from '../../models/InvoiceModel';
import moment from 'moment';
import InvoicePostgre from '../../models/Invoice';
import Sequelize from 'sequelize';
const {or, and, gt, lt} = Sequelize.Op;

const listOne = async (id: string | number): Promise<any> => {
  try {
    const respose = await InvoicePostgre.findByPk(id);
    return respose;
  } catch (err) {
    return {};
  };
};

const ListController =
async (req: Request, res: Response): Promise<Response> => {
  try {
    const filter: any = {};
    const {id} = req.params;
    const where: any = {};

    let {
      page, limitPage, payment, order,
      company, person, type,
      initialDate, finalDate,
      owner,
    }: any = req.query;

    if (id) {
      const response = await listOne(id);
      return res.status(200).json(response);
    }

    if (!page || page <= 0) {
      page = 1;
    }

    if (!limitPage || limitPage <= 0) {
      limitPage = 50;
    }

    if (payment) {
      where.payment = payment;
    }

    if (order) {
      where.order = order;
    }

    if (initialDate && finalDate &&
      moment(initialDate).isValid() &&
      moment(finalDate).isValid()
    ) {
      where[and] = [
        {paymentDate: {
          [gt]: new Date(moment(initialDate).startOf('day').format())},
        },
        {paymentDate: {
          [lt]: new Date(moment(finalDate).endOf('day').format())},
        },
      ];
    }

    if (type && ( type === 'INPUT' || type === 'OUTPUT' || type === 'ALL' ) ) {
      if ( type === 'INPUT' || type === 'OUTPUT') {
        where.typeInvoice = type;
      }

      if (type === 'INPUT' && company) {
        where.ownerCompany = company;
      }

      if (type === 'OUTPUT' && company) {
        where.company = company;
      }

      if (type === 'INPUT' && person) {
        where.ownerPerson = person;
      }

      if (type === 'OUTPUT' && person) {
        where.person = person;
      }

      if (type === 'ALL' && company) {
        if (owner) {
          where.ownerCompany = company;
        } else {
          where[or] = [
            {ownerCompany: company},
            {company: company},
          ];
        }
      }

      if (type === 'ALL' && person) {
        if (owner) {
          where.ownerPerson = person;
        } else {
          where[or] = [
            {ownerPerson: person},
            {person: person},
          ];
        }
      }
    }

    const response = await InvoicePostgre.findAll({
      where: where,
      limit: limitPage,
      offset: (page - 1) * limitPage,
      order: [
        ['paymentDate', 'DESC'],
        ['payment', 'DESC'],
        ['id', 'DESC'],
      ],
    });

    const total = await InvoicePostgre.count({
      where: where,
    });

    return res.status(200).json({
      response,
      page: page,
      pageLimit: limitPage,
      total: total,
    });
  } catch (err) {
    return res.status(400).json({
      message: 'Fail List Invoice',
      data: err.message,
    });
  }
};

export default ListController;
