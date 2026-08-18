const mongoose = require("mongoose");

const Cart = require("../../../models/Shopping/CartModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { pageIn, pageOut, customer, status } = req.query;
    const { company, companies = [] } = req;

    filter = {};
    let list;
    if (!pageIn || !pageOut) {
      return res.status(400).send({
        message: "Dados da paginação inválidos",
        Error: dadosDoErro,
      });
    }

    // restringe os dados a nivel da franquia
    filter.company = { $in: companies.length > 0 ? companies : [company] };

    if (customer && mongoose.Types.ObjectId.isValid(customer)) {
      filter.customer = customer;
    }

    if (status && typeof status === "string" && status.trim().length > 0) {
      filter.status = {
        $regex: ".*" + status.toLowerCase() + ".*",
        $options: "i",
      };
    }

    list = await Cart.find(filter)
      .populate("customer")
      .populate("company")
      .limit(parseInt(pageOut))
      .skip(parseInt(pageIn) * parseInt(pageOut));
    let numTotal = await Cart.find().countDocuments();
    return res.json({ list, total: numTotal });
  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Cart/PaginatorController.js',
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
      message: "Falha ao encontrar Paginação",
      Error: dadosDoErro,
    });
  }
};
