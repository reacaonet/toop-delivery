const Category = require('../../../models/Food/CategoryModel');

const ProductFood = require('../../../models/Food/ProductModel');

const ComplementFodd = require('../../../models/Food/ProductComplementModel');

const ItemFodd = require('../../../models//Food/ProductComplementItemModel');
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {
    const id = req.params.id

    const productListFood = await ProductFood.find({ category: id }, { _id: 1 }).lean();

    // Retorna array com ID's

    const complementListFood = await ComplementFodd.find({ product: { $in: productListFood } }, { _id: 1 }).lean();


    const itemList = await ItemFodd.find({ foodProductComplement: { $in: complementListFood } }, { _id: 1 }).lean();

    await ProductFood.deleteMany({ _id: { $in: productListFood } });

    await ComplementFodd.deleteMany({ _id: { $in: complementListFood } });

    await ItemFodd.deleteMany({ _id: { $in: itemList } });

    await Category.findByIdAndUpdate(
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
      message: "Categoria deletado com sucesso"
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Food/Category/DeleteController.js',
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
      messsage: "Falha ao deletar Categoria",
      Error: dadosDoErro
    });
  }
};