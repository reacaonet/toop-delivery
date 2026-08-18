const mongoose = require('mongoose');

const SearchUser = require('../../../src/models/SearchUser/SearchUserModel');
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
    console.log('SearchCreater')
    try {
        const {search,typeProduct,user} = req.body;
        console.log(req.body);
        const data ={
            _id : new mongoose.Types.ObjectId().toHexString(),
            user: user,
            search: search,
            typeproduct:typeProduct
        }
        console.log(data);
       let searchuser= SearchUser.create(data);


        return res.send({
            status: 200,
            message: "Consulta criada com sucesso",
            data: searchuser
        });

    } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/SearchUser/CreaterController.js',
    error: dadosDoErro?.message,
    method: 'CreaterController',
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


        console.log(dadosDoErro)
        return res.status(400).send({
            message: "Falha ao criar Categoria...",
            Error: dadosDoErro
        });
    }
};
