const ImageBank = require('../../models/ImageBankModel');
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
    try {
        const pageIn = parseInt(req.params.pageIn);
        const size = parseInt(req.params.size);
        const category = req.params.category;

        let list = [];
        let numOfImageBranks = 0;
        if(category === 'null'){
            list = await ImageBank.find().populate('packing', {name: 1}).limit(size).skip(pageIn * size);
            numOfImageBranks= await ImageBank.countDocuments();
        } else {
            list = await ImageBank.find(
                {category: { $regex: '.*' + category.toLowerCase() + '.*', $options : 'i' } }).populate('packing', {name: 1}).limit(size).skip(pageIn * size);
            numOfImageBranks= await ImageBank.count(
                {category: { $regex: '.*' + category.toLowerCase() + '.*', $options : 'i' } });
        }

        return res.json( {lista: list, numeroItens: numOfImageBranks} )
    } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/ImageBank/ListPorCategoryController.js',
    error: dadosDoErro?.message,
    method: 'ListPorCategoryController',
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
            mesage: "Falha ao encontrar Banco de imagens",
            error: dadosDoErro
        });
    }
};
