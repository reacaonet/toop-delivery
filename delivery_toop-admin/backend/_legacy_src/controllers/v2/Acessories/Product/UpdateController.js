const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const ProductModel = require('../../../../models/Accessories/ProductModel');
const ProductComplementModel = require('../../../../models/Accessories/ProductComplementModel');
const ProductComplementItemModel = require('../../../../models/Accessories/ProductComplementItemModel');
const LogModel = require("../../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    if (!data.file || (typeof data.file !== 'object')) {
      delete data.file
    }

    data.isPaused = (
      ((typeof data.isPaused === 'string') && data.isPaused === "") ||
      (data.isPaused === null)
    ) ? false : data.isPaused;

    // Trata status
    data.status = (
      ((typeof data.status === 'string') && data.status === "") ||
      (data.status === null)
    ) ? false : data.status;

    if (Array.isArray(data.file)) {
      data.images = [];
      data.file.forEach(item => data.images.push(item.url));
    } else if (data.url) {
      data.images = [];
      data.images.push(data.url)
    }

    const product = await ProductModel.findOneAndUpdate({
      _id: id
    }, data, {
      upsert: false,
      new: true
    });

    // Remove olds complements and itens
    await removeComplementsAndItem(product._id, data);

    // Save/Update complements and items
    await upsertComplementsAndItems(product._id, data);

    return res.send({
      status: 200,
      message: "Registro atualizado com sucesso",
      data: product,
    });

  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/v2/Acessories/Product/UpdateController.js',
    error: dadosDoErro?.message,
    method: 'UpdateController',
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
      message: "Falha ao atualizar Produto",
      Error: dadosDoErro
    });
  }
};

const upsertComplementsAndItems = async (productId, data) => {
  return new Promise(async (resolve, reject) => {
    try {

      if (data.complements && Array.isArray(data.complements)) {
        for await (const comp of data.complements) {
          const _id = (comp._id && ObjectId.isValid(comp._id)) ? comp._id : new mongoose.Types.ObjectId().toHexString();

          const complementPayload = {
            _id,
            product: productId,
            name: comp.name,
            amountMin: comp.amountMin,
            position: (comp.position && typeof comp.position === "number") ? comp.position : 1,
            amountMax: comp.amountMax,
            isRequired: (comp.isRequired && comp.isRequired !== '' && JSON.parse(`${comp.isRequired}`) === true) ? true : false,
            isQuantified: (comp.isQuantified && comp.isQuantified !== '' && JSON.parse(`${comp.isQuantified}`) === true) ? true : false,
            isPaused: (comp.isPaused && comp.isPaused !== '' && JSON.parse(`${comp.isPaused}`) === true) ? true : false,
            position: comp.position,
          }

          const insertComplement = await ProductComplementModel.findOneAndUpdate({
            _id: complementPayload._id
          }, {
            $set: complementPayload
          }, {
            upsert: true,
            new: true,
          });

          if (comp.items && Array.isArray(comp.items)) {
            for await (const item of comp.items) {
              const _idItem = (item._id && ObjectId.isValid(item._id)) ? item._id : new mongoose.Types.ObjectId().toHexString();

              const itemPayload = {
                _id: _idItem,
                accessoriesProductComplement: insertComplement._id,
                name: item.name,
                codPdv: item.codPdv,
                description: item.description,
                price: item.price,
                isPaused: (item.isPaused !== '' && JSON.parse(`${item.isPaused}`) === true) ? true : false,
              }

              const restu = await ProductComplementItemModel.findOneAndUpdate({
                _id: itemPayload._id
              }, {
                $set: itemPayload
              }, {
                upsert: true,
                new: true,
              })
              .catch(error => console.log('error intem', error));

            }
          }
        }
      }

      resolve(complementsAtual);
    } catch (dadosDoErro) {
  await LogModel.create({
    path: '',
    error: err?.message,
    method: '',
    type: 'error',
    level: 0,
    origin: 'backend',
    request: {
      application: request?.application,
      franchise: request?.franchise,
      company: request?.company,
      params: request?.params,
      body: request?.body,
      query: request?.query,
      heders: request?.heders,
      method: request?.method,
      url: request?.url,
    },
  });

  console.log(`Log de erro criado com sucesso.`);


      resolve(false);
    }
  })
}

const removeComplementsAndItem = async (productId, data) => {
  return new Promise(async (resolve, reject) => {
    try {

      // Get all complements new for upsert
      const complNews = (data.complements && Array.isArray(data.complements))
        ? data.complements
        : [];

      // Get all complements atual
      const complementsAtual = await ProductComplementModel.find({
        product: productId
      }, {
        _id: 1
      }).lean();

      if (complementsAtual && Array.isArray(complementsAtual) && complementsAtual.length > 0) {
        for await (const comp of complementsAtual) {
          const check = complNews.filter(c => c._id == comp._id);
          if (check && Array.isArray(check) && check.length <= 0) {
            await ProductComplementModel.findByIdAndRemove({_id: comp._id});
            await ProductComplementItemModel.deleteMany({accessoriesProductComplement: comp._id})
          } else {
            // Check Items
            // Get all items atual from complements
            const complementsItemAtual = await ProductComplementItemModel.find({
              accessoriesProductComplement: comp._id
            }, {
              _id: 1
            }).lean();

            // Get all itens new for upsert
            const complItemNews = (comp.items && Array.isArray(comp.items))
            ? comp.items
            : [];

            if (complementsItemAtual && Array.isArray(complementsItemAtual) && complementsItemAtual.length > 0) {
              for await (const item of complementsItemAtual) {
                const checkItem = complItemNews.filter(i => i._id == item._id);

                if (checkItem && Array.isArray(checkItem) && checkItem.length <= 0) {
                  await ProductComplementItemModel.findByIdAndRemove({_id: item._id});
                }
              }
            }
          }
        }
      }

      return resolve(complementsAtual);
    } catch (dadosDoErro) {
  await LogModel.create({
    path: '',
    error: err?.message,
    method: '',
    type: 'error',
    level: 0,
    origin: 'backend',
    request: {
      application: request?.application,
      franchise: request?.franchise,
      company: request?.company,
      params: request?.params,
      body: request?.body,
      query: request?.query,
      heders: request?.heders,
      method: request?.method,
      url: request?.url,
    },
  });

  console.log(`Log de erro criado com sucesso.`);


      return resolve(false);
    }
  })
}
