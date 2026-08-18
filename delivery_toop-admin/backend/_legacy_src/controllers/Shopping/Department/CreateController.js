const Department = require("../../../models/Shopping/DepartmentModel");
const CompanyModel = require("../../../models/Company/CompanyModel");
const LogModel = require("../../../models/LogModel");

const create = async (req, res) => {
  try {
    const { name, suggesteds } = req.body;
    const data = req.body;

    if (!name || name.length <= 3) {
      return res.status(400).send({
        message: "Informe um nome com pelo menos 4 caracteres!!",
      });
    }

    if (!suggesteds || typeof suggesteds !== "object" || suggesteds.length <= 0) {
      return res.status(400).send({
        message: "Informe pelo menos uma sugestão!!",
      });
    }

    data.showInApp = (typeof data.showInApp === "string" && data.showInApp === "") || data.showInApp === null ? false : data.showInApp;

    data.status = (typeof data.status === "string" && data.status === "") || data.status === null ? false : data.status;

    const payload = {
      name,
      suggesteds,
      status: data.status,
      showInApp: data.showInApp,
    };

    if (data.company) {
      const respCompany = await CompanyModel.findOne({ _id: data.company }).select({ franchise: 1 }).lean();

      if (respCompany && respCompany.franchise) {
        payload.franchise = respCompany.franchise;
      }

      payload.company = data.company;
    }

    if (data.franchise) {
      payload.franchise = data.franchise;
    }

    const createDepartment = await Department.create(payload);

    // if (suggesteds) {
    //   updateIntegration(suggesteds);
    // }

    return res.status(200).send(createDepartment);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Shopping/Department/CreateController.js',
      error: err?.message,
      method: '',
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

const updateIntegration = async suggested => {
  try {
    let querySuggested = Object.keys(suggested)
      .map(key => `suggested=${suggested[key]}`)
      .join("&");

    let { data: response } = await Integration.get(`/all/products-queue?${querySuggested}`);
    console.log("updateIntegration", response);
  } catch (err) {
    console.log("Fail updateIntegration", err);
    return;
  }
};

module.exports = { create };
