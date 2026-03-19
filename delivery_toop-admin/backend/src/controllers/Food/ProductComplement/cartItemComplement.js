const ProductComplement = require('../../../models/Food/ProductComplementModel');
const ProductComplementItem = require('../../../models/Food/ProductComplementItemModel');
const CartItem = require('../../../models/Shopping/CartItemModel');
const LogModel = require("../../../models/LogModel");

const cartItemComplement = async (req, res) => {
  try {
    let checks = [];
    let radio = [];
    const { cartItem } = req.params;


    let item = await CartItem.findOne({ _id: cartItem }).lean();

    if (item) {
      checks = await getComplementsCheck(item);
      radio = await getComplementsRadio(item);
    }

    let complements = [...checks, ...radio];

    return res.status(200).send(complements);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Food/ProductComplement/cartItemComplement.js',
      error: err?.message,
      method: 'cartItemComplement',
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

    console.log(err);
    return res.status(400).send({
      message: "Falha ao encontrar Complemento",
      Error: err.message
    });
  }
};

const getComplementsCheck = async (item) => {
  try {
    let checks = item.check;
    let complements = [];

    if (!checks || checks.length <= 0) {
      return [];
    }

    for await (check of checks) {
      let item = await ProductComplementItem
        .findById(check.id)
        .populate('foodProductComplement')
        .lean();
      complements.push(item);
    }

    return complements;
  } catch (err) {
    console.log(err);
    return [];
  }
};


const getComplementsRadio = async (item) => {
  try {
    let radios = item.radio;
    let complements = [];

    if (!radios || radios.length <= 0) {
      return [];
    }

    for await (radio of radios) {
      let item = await ProductComplementItem
        .findById(radio.id)
        .populate('foodProductComplement').lean();
      complements.push(item);
    }

    return complements;
  } catch (err) {
    console.log(err);
    return [];
  }
};

module.exports = cartItemComplement;
