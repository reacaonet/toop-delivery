const mongoose = require('mongoose');

const ProductModel = require('../../../../models/Accessories/ProductModel');
const ProductComplementModel = require('../../../../models/Accessories/ProductComplementModel');
const ProductComplementItemModel = require('../../../../models/Accessories/ProductComplementItemModel');
const LogModel = require("../../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    if (!data.file || (typeof data.file !== 'object')) {
      return res.status(400).send({
        message: 'Imagens inválidas'
      });
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
    data.images = [];
    if (Array.isArray(data.file)) {
      data.file.forEach(item => data.images.push(item.url));
    } else if (file.url) {
      data.images.push(file.url)
    }
    const product = await createProduct(data);
    // Save complements
    if (product && data.complements && Array.isArray(data.complements)) {
      await createComplementsAndItems(product._id, data.company, data.complements);
    }
    if (product) {
      return res.send({
        status: 200,
        message: "Produto criado com sucesso",
        data: product
      });
    } else {
      return res.send({
        status: 400,
        message: "Falha ao criar produtos, tente novamente mais tarde.",
        data: {}
      });
    }
  } catch (dadosDoErro) {
    await LogModel.create({
      path: 'src/controllers/v2/Acessories/Product/CreateController.js',
      error: dadosDoErro?.message,
      method: 'CreateController',
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
      message: "Falha ao criar Produto",
      Error: dadosDoErro
    });
  }
};

const createProduct = async (product) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = {
        images: product.images,
        name: product.name,
        category: product.category,
        description: product.description,
        price: product.price,
        company: product.company,
        pricePromotion: (typeof product.pricePromotion === "number") ? product.pricePromotion : undefined,
        codPdv: product.codPdv,
      }
      const productInsert = await ProductModel.create(data)
        .catch(err => console.log('Create productModel Error', err));
      resolve(productInsert);
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

const createComplementsAndItems = async (productId, companyId, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      for await (const comp of data) {
        const complementPayload = {
          _id: new mongoose.Types.ObjectId().toHexString(),
          product: productId,
          name: comp.name,
          position: (comp.position && typeof comp.position === "number") ? comp.position : 1,
          amountMin: comp.amountMin,
          amountMax: comp.amountMax,
          isRequired: (comp.isRequired !== '' && JSON.parse(`${comp.isRequired}`) === true) ? true : false,
          isQuantified: (comp.isQuantified !== '' && JSON.parse(`${comp.isQuantified}`) === true) ? true : false,
          isPaused: (comp.isPaused !== '' && JSON.parse(`${comp.isPaused}`) === true) ? true : false,
          company: companyId,
        }

        const insertComplement = await ProductComplementModel.create(complementPayload)
          .catch(err => console.log('Create Complement Error', err));

        if (comp.items && Array.isArray(comp.items)) {
          for await (const item of comp.items) {
            const itemPayload = {
              accessoriesProductComplement: insertComplement._id,
              name: item.name,
              codPdv: item.codPdv,
              description: item.description,
              price: item.price,
              isPaused: (item.isPaused !== '' && JSON.parse(`${item.isPaused}`) === true) ? true : false,
              company: companyId,
            }
            await ProductComplementItemModel.create(itemPayload)
              .catch(err => console.log('Create Item Error', err));;
          }
        }
      }
      return resolve(insertComplement);
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
