const Payment = require("../../../../models/Shopping/PaymentModel");
const LogModel = require("../../../../models/LogModel");

function ListController() {
  async function list(req, res) {
    try {

    } catch (err) {
      await LogModel.create({
        path: 'src/controllers/Shopping/Payment/Split/ListController.js',
        error: err?.message,
        method: 'ListController',
        type: 'error',
        level: 0,
        origin: 'backend',
        request: {
          application: req?.application,
          franchise: req?.franchise,
          company: req?.company,
          params: req?.params,
          body: req?.body,
          query: req?.query,
          heders: req?.heders,
          method: req?.method,
          url: req?.url,
        },
      });

      console.log(`Log de erro criado com sucesso.`);


    }
  }
}

module.exports = ListController;
