const getFranchise = require('../../services/franchise');
const LogModel = require("../../models/LogModel");

const currentFranchise = async (req, res) => {
  try {
    const { latitude, longitude } = req.params

    if (!latitude) {
      return res.status(400).send({
        message: 'Informe a coordenada corretamente'
      })
    }

    if (!longitude) {
      return res.status(400).send({
        message: 'Informe a coordenada corretamente'
      })
    }

    const current = await getFranchise(latitude, longitude);
    return res.status(200).send(current);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Franchise/CurrentFranchise.js',
      error: err?.message,
      method: 'currentFranchise',
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
      message: 'Não foi possível encontrar a franquia',
      err: err.message
    })
  }
}

module.exports = currentFranchise
