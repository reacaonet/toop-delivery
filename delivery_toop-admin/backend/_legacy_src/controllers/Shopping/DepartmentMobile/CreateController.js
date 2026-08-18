const DepartmentMob = require("../../../models/Shopping/DepartmentModelMobile");
const CompanyModel = require("../../../models/Company/CompanyModel");
const LogModel = require("../../../models/LogModel");

const create = async (req, res) => {
  try {
    const { name } = req.body;
    const data = req.body;

    if (!name || name.length <= 3) {
      return res.status(400).send({
        message: "Informe um nome com pelo menos 4 caracteres!!",
      });
    }


    data.showInApp = (typeof data.showInApp === "string" && data.showInApp === "") || data.showInApp === null ? false : data.showInApp;

    data.status = (typeof data.status === "string" && data.status === "") || data.status === null ? false : data.status;

    const payload = {
      name,
      status: data.status,
      showInApp: data.showInApp,
    };

    if (data.company) {
      const respCompany = await CompanyModel.findOne({
        _id: company,
      })
        .select({
          franchise: 1,
        })
        .lean();

      if (respCompany && respCompany.franchise) {
        payload.franchise = respCompany.franchise;
      }

      payload.company = data.company;
    }

    if (data.franchise) {
      payload.franchise = data.franchise;
    }

    const createDepartment = await DepartmentMob.create(payload);

    return res.status(200).send(createDepartment);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/DepartmentMobile/CreateController.js',
      error: err?.message,
      method: 'create',
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
      message: err.message,
    });
  }
};


module.exports = { create };
