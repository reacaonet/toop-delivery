const Product = require("../../../models/ProductModel");
const LogModel = require("../../../models/LogModel");
const mongoose = require("mongoose");

const list = async (req, res) => {
  try {
    const { company } = req.params;

    let match;

    match = { company: mongoose.Types.ObjectId(company) };

    const departments = await Product.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$department",
        },
      },
    ]);


    return res.status(200).send(departments);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/DepartmentMobile/CompanyController.js',
      error: err?.message,
      method: 'list',
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
      message: "Falha ao listar Departamentos da companhia",
      error: err.message,
    });
  }
};

module.exports = { list };
