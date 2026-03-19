/* eslint-disable max-len */
import {Request, Response} from 'express';
import {Op} from 'sequelize';

import generateToken from '../../services/Cielo/token';
import {apiBraspagSplit} from '../../services/Cielo/api';
import Transactions from '../../models/ScheduleTransactions';

const listAll = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {page, limit, initialDate, finalDate}: any = req.query;

    let url = `/schedule-api/transactions?initialCaptureDate=${initialDate}`;
    url += `&finalCaptureDate=${finalDate}`;
    url += `&pageIndex=1&pageSize=100`;

    const token = await generateToken();
    const {data: response} = await apiBraspagSplit.get(url, {
      headers: {
        // MerchantId: process.env.BRASPAG_CLIENT_ID,
        // MerchantKey: process.env.BRASPAG_CLIENT_SECRET,
        Authorization: `Bearer ${token.access_token}`,
      },
    });

    for await (const transaction of response.Transactions) {
      const {
        PaymentId,
        CapturedDate,
        MerchantId,
        Nsu,
        AuthorizationCode,
        AuthorizationDate,
        Status,
        StatusDescription,
        CardNumber,
        OrderId,
        Schedules,
      } = transaction;
      const SchedulesPayload = JSON.stringify(Schedules);

      try {
        const verifyTransactions = await Transactions.count({
          where: {
            PaymentId,
          },
        });

        if (verifyTransactions <= 0) {
          await Transactions.create({
            PaymentId,
            CapturedDate,
            MerchantId,
            Nsu,
            AuthorizationCode,
            AuthorizationDate,
            Status,
            StatusDescription,
            CardNumber,
            OrderId,
            Schedules: SchedulesPayload,
          });
        } else {
          const findTransaction = await Transactions.findOne({
            where: {
              PaymentId,
            },
          });

          if (findTransaction) {
            findTransaction.Schedules = SchedulesPayload;
            findTransaction.save();
          }
        }
      } catch (err) {
        console.log(err);
      }
    }

    const date = new Date();
    const defaultDate = `${date.getFullYear()}-${(
      '0' +
      (date.getMonth() + 1)
    ).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
    const setInitialDate = initialDate || defaultDate;
    const setFinalDate = finalDate || defaultDate;

    const setPage = page || 1;
    const setLimit = limit || 10;
    const total = await Transactions.count({
      where: {
        CapturedDate: {
          [Op.gte]: setInitialDate,
          [Op.lte]: setFinalDate,
        },
      },
    });
    const totalPage = Math.ceil(total / setLimit);
    let setOffset = 0;

    if (setPage && setPage <= totalPage) {
      if (setPage > 1) {
        setOffset = setPage * setLimit - setLimit;
      }
    } else {
      return res.status(404).json({
        message: `This page does not exist.`,
        data: {
          totalPages: totalPage,
          page: setPage,
          transactions: [],
        },
      });
    }

    const transactions = await Transactions.findAll({
      limit: setLimit,
      offset: setOffset,
      where: {
        CapturedDate: {
          [Op.gte]: setInitialDate,
          [Op.lte]: setFinalDate,
        },
      },
    });
    const newTransaction = [];

    for await (const transaction of transactions) {
      try {
        const {data} = await apiBraspagSplit.get(`/api/transactions/${transaction.PaymentId}/split`, {
          headers: {
            // MerchantId: process.env.BRASPAG_CLIENT_ID,
            // MerchantKey: process.env.BRASPAG_CLIENT_SECRET,
            Authorization: `Bearer ${token.access_token}`,
          },
        });
        const getTransaction: any = transaction.toJSON();
        if (Object.keys(data.SplitPayments).length > 1) {
          getTransaction.SplitPayments = {
            detail: data.SplitPayments,
            qty: Object.keys(data.SplitPayments).length - 1,
          };
        }
        newTransaction.push(getTransaction);
      } catch (err) {
        newTransaction.push(transaction);
        continue;
      }
    }

    return res.status(200).json({
      message: 'Successful cancellation total',
      data: {
        totalPages: totalPage,
        page,
        transactions: newTransaction,
      },
    });
  } catch (err) {
    let errPayload = null;
    if (err.response && err.response.data) {
      errPayload = err.response.data;
    } else {
      errPayload = err.message;
    }

    return res.status(400).json({
      message: 'Fail cancellation total',
      data: errPayload,
    });
  }
};

export default listAll;
