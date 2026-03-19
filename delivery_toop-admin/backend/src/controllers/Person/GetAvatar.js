const mongoose = require("mongoose");
const Person = require("../../models/Person/PersonModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    let filter = {};

    if (id && mongoose.Types.ObjectId.isValid(id)) {
      filter._id = {
        $eq: mongoose.Types.ObjectId(id),
      }
    }

    filter.image = {
      $exists: true,
    }

    const person = await Person.aggregate([
      {
        $match: filter,
      },
      {
        $project: {
          image: 1,
          _id: 1,
        },
      },
    ]);

    return res.status(200).send({ person });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Person/GetAvatar.js',
      error: err?.message,
      method: 'GetAvatar',
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
      message: err.message,
    });
  }
};
