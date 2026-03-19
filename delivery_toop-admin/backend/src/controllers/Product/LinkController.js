const Product = require('../../models/ProductModel');
const Department = require("../../models/Shopping/DepartmentModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { productId, ecbrBankId } = req.body;
    let names = ecbrBankId.departments.map(array => array.name)

    const departmentArray = await Department.find(
      {
        name: { $in: names }
      },
      {
        _id: 1
      });

    const novoRegistro = await Product.findOneAndUpdate(
      {
        _id: productId
      },
      {
        name: ecbrBankId.name,
        images: ecbrBankId.images,
        department: departmentArray,
        productDepartmentId: ecbrBankId._id
      },
      {
        upsert: false,
        new: true
      });

    return res.send({
      data: {novoRegistro, names},
      status: 200,
      message: "Produto vinculado com sucesso"
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Product/LinkController.js',
    error: dadosDoErro?.message,
    method: 'LinkController',
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
      mesage: "Falha ao vincular Produto",
      error: dadosDoErro
    });
  }
};
