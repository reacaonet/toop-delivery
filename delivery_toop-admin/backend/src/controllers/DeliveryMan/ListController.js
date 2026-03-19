const mongoose = require("mongoose");

const DeliveryMan = require('../../models/DeliveryMan/DeliveryManModel');
const LogModel = require('../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const id = req.params.id;

    const { isOnline, onRoute, search } = req.query;
    const filterSearch = {};

    let list;
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      list = await listOne(id, req);
    } else if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "Id inválido",
      });
    } else {
      let filter = {};

      filter.deletedAt = {
        $exists: false,
      }

      if (isOnline) {
        filter.isOnline = isOnline;
      }

      if (onRoute) {
        filter.flag = "ON_ROUTE";
      }

      if (search && (typeof search === 'string')) {
        filterSearch.$or = [
          { 'person.name': { $regex: new RegExp(search, 'i') } },
          { 'person.phone': { $regex: new RegExp(search, 'i') } }
        ];
      }

      if (search) {
        // usado na tela de pedidos
        list = await DeliveryMan.aggregate([
          { $match: { isOnline: true } },
          {
            $lookup: {
              from: "person",
              let: { id: "$person" },
              as: "person",
              pipeline: [
                {
                  $match: { $expr: { $eq: ["$_id", "$$id"] } },
                },
                { $limit: 1 },
              ]
            }
          },
          { $unwind: { path: "$person", preserveNullAndEmptyArrays: true } },
          {
            $match: filterSearch
          },
          { $limit: 10 }
        ]);
      } else {
        list = await DeliveryMan.find(filter).populate("company").populate('person', { name: 1 });
      }
    }

    return res.json(list)
  } catch (dadosDoErro) {

    return res.status(400).send({
      mesage: "Falha ao encontrar Cadastro de Entregas",
      error: dadosDoErro
    });
  }
};

const listOne = async (id, req) => {
  try {
    return await DeliveryMan
      .findById(id)
      .populate("company")
      .populate('person', {
        _id: 1,
        name: 1,
        cpf: 1,
        phone: 1,
      })
      .lean();
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/DeliveryMan/ListController.js',
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

    return {};
  }
}
