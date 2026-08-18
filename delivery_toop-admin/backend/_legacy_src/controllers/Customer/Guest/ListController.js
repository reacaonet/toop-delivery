const Guest = require('../../../models/Customer/GuestModel');
const LogModel = require("../../../models/LogModel");

function ListController() {
  async function listOne(req, res) {
    try {
      const { device } = req.params;
      let guest = await Guest.findOne({ device }).lean();

      return res.status(200).send(guest);
    } catch (err) {
      await LogModel.create({
        path: 'src/controllers/Customer/Guest/ListController.js',
        error: err?.message,
        method: 'listOne',
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

      return res.status(400).send({
        message: 'Fail List One'
      });
    }
  }

  return {
    listOne
  }
}

module.exports = ListController;
