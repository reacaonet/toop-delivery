const VoucherModel = require('../../../../models/Finance/DigitalAccounts/VoucherModel');
const LogModel = require('../../../../models/LogModel');

const paginatorController = async (request, reply) => {
  try {
    const { pageIn, pageOut } = request.query;
    const { franchise } = request;

    if (!franchise) {
      throw new Error('Franchise not found');
    }

    const filter = {};

    filter.franchise = franchise;

    if (!pageIn || !pageOut) {
      return reply.status(400).send({
        message: 'Dados da paginação inválidos',
      });
    }

    filter.deletedAt = {
      $exists: false,
    };

    const list = await VoucherModel.find(filter)
      .limit(parseInt(pageOut))
      .skip(parseInt(pageIn) * parseInt(pageOut));

    const numTotal = await VoucherModel.find(filter).countDocuments();

    return reply.send({ list, total: numTotal });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v1/wallet/Voucher/PaginatorController.ts',
      error: err?.message,
      method: 'paginatorController',
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
      message: 'Falha ao encontrar Paginação',
      err: err.message,
    });
  }
};

module.exports = paginatorController;
