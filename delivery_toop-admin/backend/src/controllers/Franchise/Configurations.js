const CompanyModel = require('../../models/Company/CompanyModel')


const configurations = async (req, res) => {
  try {
    const {company} = req.params

    if (!company) {
      return res.status(400).send({
        message: 'Informe uma empresa válida'
      })
    }

    const resp = await CompanyModel.findById(company).populate('franchise')
    const payload = {}
    payload.activateTip = false

    if (resp && resp.franchise) {
      payload.activateTip = resp.franchise.activateTip ? true : false
    }

    return res.status(200).send(payload)
  } catch (err) {
  await LogModel.create({
    path: '',
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
      message: 'Não foi possível listar configurações',
      err: err.message,
    })
  }
}

module.exports = configurations
