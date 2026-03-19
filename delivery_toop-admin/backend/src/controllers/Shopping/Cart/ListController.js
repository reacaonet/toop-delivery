const mongoose = require("mongoose");

const Cart = require("../../../models/Shopping/CartModel");
const LogModel = require("../../../models/LogModel");

/**
 * Lista carrinhos de compras
 * Obrigatoriamente por customer
 * E opcionalmente por company
 */
module.exports = async (req, res) => {
  try {
    const customer = req.params.customer;
    const company = req.params.company;

    // Filtros por query
    const { status, isDeleted, type } = req.query;

    let filter = { customer };

    if (!customer || !mongoose.Types.ObjectId.isValid(customer)) {
      return res.status(400).send({
        message: "Cliente inválido",
      });
    }

    if (company) {
      if (!mongoose.Types.ObjectId.isValid(company)) {
        return res.status(400).send({
          message: "Empresa inválida",
        });
      }

      // Filtra por company
      filter.company = company;
    }

    let and = [];

    and.push({
      isDeleted: isDeleted === "true",
    });

    if (status) {
      and.push({
        status,
      });
    }

    filter = { $and: and, ...filter };

    const list = await Cart.find(filter)
      .populate("customer", { name: 1, status: 1 })
      .populate({
        path: "company",
        select: {
          type: 1,
          name: 1,
          status: 1,
          groups: 1,
        },
        populate: {
          path: "companyDelivery",
          select: {
            typePayments: 1,
          },
          populate: {
            path: "typePayments",
            select: {
              _id: 1,
              name: 1,
              type: 1,
            },
          },
        },
      })
      .sort({ createdAt: -1 });

    return res.json(list);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Cart/ListController.js',
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

    return res.status(400).send({
      message: "Falha ao encontrar carrinho",
      err: err.message,
    });
  }
};
