const mongoose = require("mongoose");

const DocumentTypeModel = require("../../../models/Mobility/DocumentType/DocumentTypeModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, type, name, status } = req.query;
    const { isRoot, franchise: franchiseAuth } = req;

    let filter = {};
    let list;

    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
      });
    }

    if (!isRoot) {
      filter.franchise = mongoose.Types.ObjectId(franchiseAuth);
    }

    // --> name filter
    if (name) {
      const decodeName = decodeURIComponent(name);
      filter.name = {
        $regex: ".*" + decodeName.toLowerCase() + ".*",
        $options: "i",
      };
    }

    // --> type filter
    if (type) {
      const decodeType = decodeURIComponent(type);
      filter.type = {
        $regex: ".*" + decodeType.toLowerCase() + ".*",
        $options: "i",
      };
    }

    if (`${status}` === "false" || `${status}` === "true") {
      filter.status = { $eq: JSON.parse(`${status}`) };
    } else if (!status || status !== "all") {
      filter.status = { $eq: true };
    }

    // --> not deleted
    filter.deletedAt = {
      $exists: false,
    };

    list = await DocumentTypeModel.aggregate([{ $match: filter }, { $limit: parseInt(pageOut) }, { $skip: parseInt(pageIn) * parseInt(pageOut) }]);
    let numTotal = await DocumentTypeModel.find(filter).countDocuments();

    return res.json({ list, total: numTotal });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Mobility/DocumentType/PaginatorController.js',
    error: dadosDoErro?.message,
    method: 'PaginatorController',
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
      message: "Falha ao encontrar registros para Paginação",
      Error: dadosDoErro,
    });
  }
};
