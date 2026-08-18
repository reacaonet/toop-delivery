
const PersonModel = require('../../../models/Person/PersonModel');

const CustomerModel = require('../../../models/CustomerModel');
const LogModel = require('../../../models/LogModel');

module.exports = async (req, res) => {
  try {

    const { type, field } = req.query;

    if (type === 'person') {
      if (field === 'phone') {
        const result = await PersonModel.aggregate([
          {
            $group: {
              _id: "$phone",
              nmPhone: {
                $sum: 2
              },
            },
          },
        ]);

        return res.json(result)
      }

      if (field === 'email') {
        const result = await PersonModel.aggregate([
          {
            $group: {
              _id: "$email",
              nmEmail: {
                $sum: 2
              },
            },
          },
        ]);

        return res.json(result)
      }
    }


    if (type === 'customer') {
      if (field === 'phone') {
        const result = await CustomerModel.aggregate([
          {
            $group: {
              _id: "$phone",
              nmPhone: {
                $sum: 2
              },
            },
          },
        ]);

        return res.json(result)
      }

      if (field === 'email') {
        const result = await CustomerModel.aggregate([
          {
            $group: {
              _id: "$email",
              nmEmail: {
                $sum: 2
              },
            },
          },
        ]);

        return res.json(result)
      }
    }

    return res.json({})
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/Duplicate/DuplicateRecords/ListRegisterDuplicateController.js',
    error: dadosDoErro?.message,
    method: 'ListRegisterDuplicateController',
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
      message: "Falha ao encontrar Registro",
      Error: dadosDoErro
    });
  }
};
