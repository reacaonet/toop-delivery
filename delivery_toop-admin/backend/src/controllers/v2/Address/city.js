/* Model */
const CityModel = require('../../../models/Address/CityModel')
const LogModel = require("../../../models/LogModel");

const listCity = async (req, res) => {
  try {
    const { codigo_uf, nome } = req.query
    const filter = {};

    if (codigo_uf) {
      filter.codigo_uf = codigo_uf
    }

    if (nome) {
      filter['$text'] = {
        $search: nome.toLowerCase()
      }

      // filter.nome = {
      //   $regex: ".*" + nome.toLowerCase() + ".*",
      //   $options: "i",
      // };
    }

    const list = await CityModel
      .find(filter)
      .sort({
        nome: 1,
      })
      .lean()

    return res.status(200).send(list)
  } catch (err) {
  await LogModel.create({
    path: 'https://bitbucket.org/delivery_toop/admin/src/eb9ebfc841433913028d10b21c3db1cbbc20826c/backend/src/controllers/v2/Address/city.js',
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
      message: 'Não foi possível listar as cidades',
      err: err.message
    })
  }
}

module.exports = listCity;
