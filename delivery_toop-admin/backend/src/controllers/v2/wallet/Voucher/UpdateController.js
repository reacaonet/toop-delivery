const VoucherModel = require('../../../../models/Finance/DigitalAccounts/VoucherModel');
const LogModel = require('../../../../models/LogModel');

const updateController = async (request, reply) => {
  try {
    const id = request.params.id;
    const data = request.body;

    data.status =
      (typeof data.status === 'string' && data.status === '') ||
        data.status === null
        ? false
        : data.status;

    const novoRegistro = await VoucherModel.findOneAndUpdate(
      {
        _id: id,
      },
      data,
      {
        upsert: true,
        new: true,
      },
    );

    reply.send({
      status: 200,
      message: 'Voucher atualizado com sucesso',
      data: novoRegistro,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v1/wallet/Voucher/UpdateController.ts',
      error: err?.message,
      method: 'updateController',
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
      message: 'Falha ao atualizar Voucher',
      err: err.message,
    });
  }
};

module.exports = updateController;
