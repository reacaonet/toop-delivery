const Product = require("../../../models/ProductModel");
const LogModel = require("../../../models/LogModel");
const mongoose = require("mongoose");

const list = async (req, res) => {
  try {
    const { company } = req.params;

    console.log(company);

    let match;

    // if (company && mongoose.isValidObjectId(company)) {
    //   match = { company: mongoose.Types.ObjectId(company) };
    // }

    match = { company: mongoose.Types.ObjectId(company) };

    console.log(match);

    // let department = {
    //   from: "department",
    //   as: "department",
    //   let: { departmentId: "$department" },
    //   pipeline: [
    //     {
    //       $match: {
    //         $expr: { $eq: ["$_id", "$$departmentId"] },
    //       },
    //     },
    //     { $project: { name: 1, suggesteds: 1 } },
    //     {
    //       $limit: 1,
    //     },
    //   ],
    // };
    // console.log("Entrou");

    // const departments = await Product.aggregate([
    //   { $match: match },
    //   { $lookup: department },
    //   {
    //     $unwind: {
    //       path: "$department",
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$department",
    //       total: { $sum: 1 },
    //     },
    //   },
    // ]);

    const departments = await Product.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$department",
        },
      },
    ]);

    console.log("Consultou");

    return res.status(200).send(departments);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Department/CompanyController.js',
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
