const mongoose = require("mongoose");

/** Model */
const ProductModel = require("../../models/ProductModel");
const SortDepartments = require("../../models/Shopping/sortDepartmentModel");
const LogModel = require("../../models/LogModel");

const listSortDepartment = async (req, res) => {
  try {
    const { company } = req.params;

    if (!company || !mongoose.isValidObjectId(company)) {
      return res.status(400).send({
        message: "Informa uma empresa válida",
      });
    }

    const response = await SortDepartments.find({ company: company })
      .select({
        order: 1,
        department: 1,
      })
      .populate({
        path: "department",
        select: {
          name: 1,
        },
      })
      .sort({
        order: 1,
      })
      .lean();

    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Product/sortDepartmentController.js',
      error: err?.message,
      method: 'listSortDepartment',
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
      message: "Não foi possível listar",
    });
  }
};

const verifyCreateSortDepartment = async (req, res) => {
  try {
    const { company } = req.params;

    if (!company || !mongoose.isValidObjectId(company)) {
      return res.status(400).send({
        message: "Informa uma empresa válida",
      });
    }

    const allBut = [];
    const listSort = await SortDepartments.find({ company: company }).lean();

    for await (const item of listSort) {
      if (item.department) {
        allBut.push(item.department);
      }
    }

    const listDepartments = await ProductModel.aggregate([
      {
        $match: {
          company: mongoose.Types.ObjectId(company),
          department: {
            $nin: allBut,
          },
        },
      },
      {
        $group: {
          _id: "$department",
        },
      },
    ]);

    const departments = [];

    // Registrar
    for await (const item of listDepartments) {
      if (item && item._id && Array.isArray(item._id) && item._id.length) {
        console.log("adicionando um novo ...");
        await SortDepartments.create({
          department: item._id[0],
          company: company,
          order: 200,
        });
      }
    }

    const response = await SortDepartments.find({ company: company })
      .select({
        order: 1,
        department: 1,
      })
      .populate({
        path: "department",
        select: {
          name: 1,
        },
      })
      .sort({
        order: 1,
      })
      .lean();

    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Product/sortDepartmentController.js',
      error: err?.message,
      method: 'verifyCreateSortDepartment',
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
      message: "Não foi possível listar",
      err: err.message,
    });
  }
};

const updateSortDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { order, company } = req.body;

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).send({
        message: "Informe um departamento válido",
      });
    }

    if (!order) {
      return res.status(400).send({
        message: "Informe a ordem",
      });
    }

    await SortDepartments.updateOne(
      { _id: id },
      {
        order: order,
        company: company,
      },
      { upsert: true },
    );

    return res.status(200).send({});
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Product/sortDepartmentController.js',
      error: err?.message,
      method: 'updateSortDepartment',
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
      message: "Não foi possível salvar",
    });
  }
};

module.exports = { listSortDepartment, verifyCreateSortDepartment, updateSortDepartment };
