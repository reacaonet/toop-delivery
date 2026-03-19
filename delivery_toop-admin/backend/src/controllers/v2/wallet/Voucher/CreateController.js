const VoucherModel = require('../../../../models/Finance/DigitalAccounts/VoucherModel');
const LogModel = require('../../../../models/LogModel');

const createController = async (request, reply) => {
  const franchise = request.franchise;

  try {
    const data = request.body;

    if (!franchise) {
      throw new Error('Franchise not found');
    }

    data.franchise = franchise;

    if (!data.code) {
      return reply.status(400).send({
        message: 'Insira o Código do Voucher',
      });
    }

    if (!data.value) {
      return reply.status(400).send({
        message: 'Insira o Valor do crédito',
      });
    }

    if (!data.limit || data.limit === 0) {
      return reply.status(400).send({
        message: 'Insira o limite de uso',
      });
    }

    if (!data.dateInit || !data.dateFinish) {
      return reply.status(400).send({
        message: 'Insira o periodo da vigência do voucher',
      });
    }

    data.status =
      (typeof data.status === 'string' && data.status === '') ||
        data.status === null
        ? false
        : data.status;

    // valida se exite voucher com o mesmo codigo
    const voucherValidate = await VoucherModel.findOne({
      code: data.code,
      franchise: franchise,
      deletedAt: {
        $exists: false,
      },
    }).lean();

    if (voucherValidate && voucherValidate._id) {
      return reply.status(400).send({
        message: 'O Código já está sendo usado em outro voucher',
      });
    }

    const voucher = await VoucherModel.create(data);

    return reply.status(201).send({
      status: 200,
      message: 'Voucher cadastrado com sucesso',
      data: voucher,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v1/wallet/Voucher/CreateController.ts',
      error: err?.message,
      method: 'createController',
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

    return reply.status(400).send({
      message: 'Falha ao criar voucher',
      error: err,
    });
  }
};

module.exports = createController;
