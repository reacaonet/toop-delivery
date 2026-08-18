const Guest = require('../../../models/Customer/GuestModel');
const LogModel = require("../../../models/LogModel");

function UpdateController() {
  async function update(req, res) {
    try {
      const { device, latitude, longitude } = req.body;
      let data = {};

      if (!device || device.length <= 6) {
        return res.status(400).send({
          message: 'Informe um device válido'
        });
      }

      data.device = device;

      if (latitude && longitude) {
        data.location = {
          type: 'Point',
          coordinates: [Number(longitude), Number(latitude)]
        };
      }

      const response = await Guest.findOneAndUpdate(
        { device },
        data,
        { upsert: true, new: true }
      );

      return res.status(200).send(response);
    } catch (err) {
      await LogModel.create({
        path: 'src/controllers/Customer/Guest/UpdateController.js',
        error: err?.message,
        method: 'update',
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
        message: 'Fail Update',
      });
    }
  }

  return {
    update,
  };
}

module.exports = UpdateController;
