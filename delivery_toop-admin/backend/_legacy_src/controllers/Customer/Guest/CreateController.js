const Guest = require('../../../models/Customer/GuestModel');
const LogModel = require("../../../models/LogModel");

function CreateController() {
  async function create(req, res) {
    try {
      const { device, latitude, longitude } = req.body;
      let data = {};

      if (!device || device.length <= 6) {
        return res.status(400).send({
          message: 'Informe um device válido'
        });
      }

      console.log('CreateController', device, latitude, longitude);
      data.device = device;

      if (latitude && longitude) {
        data.location = {
          type: 'Point',
          coordinates: [Number(longitude), Number(latitude)]
        };
      }

      let guest = await Guest.findOne({ device }).lean();

      if (guest && guest._id && data.location) {
        guest = await Guest.findOneAndUpdate(
          { device },
          data,
          { upsert: true, new: true }
        );
        return res.status(200).send(guest);
      } else if (guest && guest._id) {
        return res.status(200).send(guest);
      }

      guest = await Guest.create(data);
      return res.status(200).send(guest);
    } catch (err) {
      await LogModel.create({
        path: 'src/controllers/Customer/Guest/CreateController.js',
        error: err?.message,
        method: 'create',
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
        message: 'Fail Create Guest',
      });
    }
  }

  return {
    create
  }
}

module.exports = CreateController;
