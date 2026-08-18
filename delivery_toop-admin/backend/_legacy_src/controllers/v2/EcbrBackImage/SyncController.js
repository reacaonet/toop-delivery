
const EcbrImageBank = require('../../../models/ProductDepartment/EcbrProductDepartment');
const Product = require('../../../models/ProductModel');
const LogModel = require("../../../models/LogModel");

const syncProducts = async (req, res) => {
  try {

    const productsBanck = await EcbrImageBank.find()
      .catch(err => {
        return res.status(400).send({
          message: 'Falha ao listar os produtos do banco',
          err: err.message,
        })
      })

    productsBanck.map(async (productBank) => {
      productToLink = await Product.updateMany(
        {
          barcode: productBank.barcode
        },
        {
          name: productBank.name,
          images: productBank.images,
          department: productBank.departments,
          productDepartmentId: productBank._id
        },
        {
          upsert: false,
          new: true
        })
    });

    // const response = await Topic.find(filter).lean();
    return res.status(200).send({
      status: 200,
      message: 'Produtos vinculados com sucesso!'
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/EcbrBackImage/SyncController.js',
      error: err?.message,
      method: 'syncProducts',
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
      message: 'Falha ao listar topicos',
      err: err.message,
    });
  }
};

module.exports = syncProducts;
