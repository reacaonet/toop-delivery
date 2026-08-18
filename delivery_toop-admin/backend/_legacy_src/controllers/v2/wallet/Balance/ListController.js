const mongoose = require('mongoose');

const walletBalance = require('../../../../services/Finance/DigitalAccounts/balance');
const LogModel = require('../../../../models/LogModel');

const listController = async (request, reply) => {
  try {
    const { customer, passenger } = request.query;

    if (
      (!customer || !mongoose.Types.ObjectId.isValid(customer)) &&
      (!passenger || !mongoose.Types.ObjectId.isValid(passenger))
    ) {
      return reply.status(400).send({
        message: 'Insira o ID do cliente ou passageiro',
      });
    }

    const balance = await walletBalance.getCustomerPassengerBalance(
      customer,
      passenger,
    );

    return reply.send(balance);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v1/wallet/Balance/ListController.ts',
      error: err?.message,
      method: 'listController',
      type: 'error',
      level: 0,
      origin: 'backend',
      request: {
        application: request?.application,
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

module.exports = listController;
