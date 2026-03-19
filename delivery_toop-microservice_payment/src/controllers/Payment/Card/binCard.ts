/* eslint-disable valid-jsdoc */
import {Request, Response} from 'express';
import {apiQueryCielo} from '../../../services/Cielo/api';
import creditCardType from 'credit-card-type';

/**
 * Bandeiras aceita pela Braspag
 * Visa, Master, Amex, Elo, Aura, Jcb, Diners, Discover, Sorocred
 */
const binCard = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {cardNumber} = req.params;


    // const response = await apiQueryCielo.get(`/1/cardBin/${cardNumber}`, {
    //   headers: {
    //     MerchantId: process.env.MERCHANT_ID,
    //     MerchantKey: process.env.MERCHANT_KEY,
    //   },
    // });

    // if (response.data.Provider === 'MASTERCARD') {
    //   response.data.Provider = 'MASTER';
    // }

    // return res.status(200).json({
    //   message: 'Successful list Card Bin',
    //   data: response.data,
    // });

    const firstNumbers =cardNumber.slice(0, 4);
    const bandeiraTipo = creditCardType(firstNumbers);
    let bandeira = '';


    if (bandeiraTipo && bandeiraTipo.length > 0) {
      bandeira = bandeiraTipo[0].niceType;
    } else {
      return res.status(400).send({
        message: 'Bandeira não Suportada ou não identificada',
      });
    }

    if (
      `${bandeira.toLocaleLowerCase()}` === 'mastercard' ||
      `${bandeira.toLocaleLowerCase()}` === 'maestro'
    ) {
      bandeira = 'Master';
    }

    return res.status(200).json({
      message: 'Successful list Card Bin',
      data: {
        Status: '00',
        Provider: bandeira,
      },
    });
  } catch (err) {
    // console.log('err', err);


    let errPayload = null;
    if (err.response && err.response.data) {
      errPayload = err.response.data;
    } else {
      errPayload = err.message;
    }


    return res.status(400).json({
      message: 'Fail list Card Bin',
      data: errPayload,
    });
  }
};

export default binCard;
