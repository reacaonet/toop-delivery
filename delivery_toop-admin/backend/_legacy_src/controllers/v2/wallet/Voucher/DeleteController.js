const mongoose = require('mongoose');
const VoucherModel = require('../../../../models/Finance/DigitalAccounts/VoucherModel');
const LogModel = require('../../../../models/LogModel');

const deleteController = async (request, reply) => {
  try {
    const id = request.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return reply.status(400).send({
        message: 'Id do registro inválido',
      });
    }

    await VoucherModel.findByIdAndUpdate(
      { _id: id },
      {
        $set: { deletedAt: new Date() },
      },
      {
        new: true,
      },
    );

    reply.send({
      status: 200,
      message: 'Voucher deletado com sucesso',
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v1/wallet/Voucher/DeleteController.ts',
      error: err?.message,
      method: 'deleteController',
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
      message: 'Falha ao deletar Voucher',
      err: err.message,
    });
  }
};

module.exports = deleteController;
