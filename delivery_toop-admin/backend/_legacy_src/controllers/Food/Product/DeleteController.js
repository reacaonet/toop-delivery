const Product = require('../../../models/Food/ProductModel');

const Item = require('../../../models/Food/ProductComplementItemModel');

const Complement = require('../../../models/Food/ProductComplementModel');
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const id = req.params.id

    const complementListFood = await Complement.find({ product: id }, { _id: 1 }).lean();

    const itemList = await Item.find({ foodProductComplement: { $in: complementListFood } }, { _id: 1 }).lean();


    await Complement.deleteMany({ _id: { $in: complementListFood } });

    await Item.deleteMany({ _id: { $in: itemList } });

    await Product.findByIdAndUpdate(
      id,
      {
          $set: {
              deletedAt: new Date(),
          },
      },
      {
          new: true,
      },
    )

    res.send({
      status: 200,
      message: "Produto deletado com sucesso"
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Food/Product/DeleteController.js',
    error: dadosDoErro?.message,
    method: 'DeleteController',
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
      messsage: "Falha ao deletar Produto",
      Error: dadosDoErro
    });
  }
};