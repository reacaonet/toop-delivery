const Customer = require('../../models/CustomerModel');
const LogModel = require("../../models/LogModel");

const customerSearch = async (req, res) => {
  try {
    const { email, phone, limit } = req.query;
    let filter = {};
    let or = [];
    let limitPage = 10;

    if (!email && !phone) {
      return res.status(400).send({
        message: 'Informe um email ou telefone'
      });
    }

    if (email) {
      or.push({
        email: { $regex: '.*' + email.toLowerCase() + '.*', $options: 'i' }
      });
    }

    if (phone) {
      or.push({
        phone: { $regex: '.*' + phone.toLowerCase() + '.*', $options: 'i' }
      });
    }

    if (limit && limit > 0) {
      limitPage = limit;
    }

    filter.$or = or;

    let response = await Customer.find(filter)
      .select({
        person: 1,
        email: 1,
        phone: 1,
        instanceIdToken: 1,
      })
      .limit(limitPage)
      .lean();

    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Customer/CustomerSearchController.js',
      error: err?.message,
      method: 'customerSearch',
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
      message: 'Não foi possível buscar informações',
      err: err.message,
    });
  }
};

module.exports = customerSearch;
