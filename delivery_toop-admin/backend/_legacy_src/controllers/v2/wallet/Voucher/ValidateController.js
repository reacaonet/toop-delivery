const mongoose = require('mongoose');

const PassengerModel = require('../../../../models/Mobility/Passenger/PassengerModel');
const VoucherModel = require('../../../../models/Finance/DigitalAccounts/VoucherModel');
const LogModel = require('../../../../models/LogModel');

const BankTransactions = require('../../../../services/Finance/DigitalAccounts/BankTransactions');
const digitalAccounts = require('../../../../services/Finance/DigitalAccounts/getAccount');
const moment = require('moment-timezone');

const validateController = async (request, reply) => {
  try {
    const data = request.body;

    if (!data.code) {
      return reply.status(400).send({
        message: 'Insira o Código do Voucher',
      });
    }

    if (!data.passenger || !mongoose.Types.ObjectId.isValid(data.passenger)) {
      return reply.status(400).send({
        message: 'Insira o ID do passageiro válido',
      });
    }

    const passenger = await PassengerModel.findOne({
      _id: data.passenger,
    }).lean();

    if (!passenger || !passenger?.franchise) {
      return reply.status(400).send({
        message: 'Franquia não localizada! Tente novamente',
      });
    }

    // valida se exite o voucher
    const voucher = await VoucherModel.findOne({
      code: data.code,
      franchise: passenger.franchise,
      deletedAt: {
        $exists: false,
      },
    }).lean();

    if (!voucher) {
      return reply.status(400).send({
        message: 'Código inválido',
      });
    }

    if (!moment().utc(true).isBetween(voucher.dateInit, voucher.dateFinish)) {
      return reply.status(400).send({
        message: 'Voucher expirado!',
      });
    }

    if (Array.isArray(voucher.used) && voucher.limit === voucher.used.length) {
      return reply.status(400).send({
        message: 'Todos os vouchers foram usado! Tente com um novo código!',
      });
    }

    /** verifica se o passageiro ja usou o voucher */
    if (
      voucher.used &&
      Array.isArray(voucher.used) &&
      voucher.used.find((i) => i.passenger.toString() === data.passenger)
    ) {
      return reply.status(400).send({
        message: 'Você já usou esse Voucher!',
      });
    }

    const account = await digitalAccounts(
      data.passenger,
      "Person",
      passenger.franchise,
      true
    );

    await BankTransactions({
      originAgency: account.agency,
      destinationAgency: account.agency,
      originAccount: account._id,
      destinationAccount: account._id,
      value: voucher.value,
      type: "credit",
      method: 'DEPOSIT',
      status: "COMPLETED",
      description: 'Crédito na Carteira Digital via Voucher',
      payload: {
        passenger: data.passenger,
        voucherCode: voucher.code,
        voucher,
      },
      franchise: passenger.franchise,
    });

    voucher.used.push({
      passenger: passenger._id,
      usedAt: moment().utc(true).format('YYYY-MM-DD HH:mmm:ss'),
    });

    await VoucherModel.findByIdAndUpdate(
      voucher._id,
      {
        $set: {
          used: voucher.used,
        },
      },
      {
        new: true,
      },
    );

    return reply.status(201).send({
      message: 'ok',
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v1/wallet/Voucher/ValidateController.ts',
      error: err?.message,
      method: 'validateController',
      type: 'error',
      level: 0,
      origin: 'backend',
      request: {
        franchise: request?.franchise,
        params: request?.params,
        body: request?.body,
        query: request?.query,
        heders: request?.heders,
        method: request?.method,
        url: request?.url,
      },
    });

    console.log(err);

    return reply.status(400).send({
      message: 'Falha ao criar pagamento',
      Error: err,
    });
  }
};

module.exports = validateController;
