/* LIB */
const moment = require('moment');

/** Model */
const Product = require('../../models/ProductModel');
const EcbrDepartment = require('../../models/ProductDepartment/EcbrProductDepartment');
const LogModel = require("../../models/LogModel");

var naoSincronizado = [];
var sincronizados = [];

const sync = async (req, res) => {
  try {
    req.setTimeout(0);
    const products = req.body;
    naoSincronizado = [];
    sincronizados = [];

    if (!products || typeof products !== 'object' || products.length <= 0) {
      return res.status(400).send({
        message: 'Nenhuma informação enviada ....'
      });
    }

    for await (let product of products) {
      if (product.company) {
        let productCad = await Product.findOne({
          company: product.company,
          barcode: getBarcode(product.codigoBarra),
        }).lean();

        if (productCad) {
          await updateProduct(product, productCad);
        } else {
          await addProduct(product);
        }
      } else {
        naoSincronizado.push(product);
      }
    }

    return res.status(200).send({
      naoSincronizado: naoSincronizado,
      sincronizados: sincronizados,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/SynchronizeProducts/SyncController.js',
      error: err?.message,
      method: 'sync',
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

    // console.log('Fail', err);
    return res.status(400).send({
      message: err.message,
    });
  }
}

const addProduct = async (product) => {
  try {
    let images = [];
    let name = product.nome;
    let keywords = [];
    let description = '';
    let departments = [];
    let barcode = getBarcode(product.codigoBarra);
    let copyright = false;
    let item = {};

    let ecbrDepartment = await EcbrDepartment.findOne({
      barcode: barcode,
    }).lean();

    if (!ecbrDepartment || !ecbrDepartment._id) {
      item.existImageBank = false;
    } else {
      item.existImageBank = true;
    }

    if (ecbrDepartment && ecbrDepartment.images && ecbrDepartment.images.length > 0) {
      images = ecbrDepartment.images;
      if (ecbrDepartment.copyright) {
        copyright = true;
      }
    }

    if (ecbrDepartment && ecbrDepartment.name) {
      name = ecbrDepartment.name;
    }

    if (ecbrDepartment && ecbrDepartment.keywords) {
      keywords = ecbrDepartment.keywords;
    }

    if (ecbrDepartment && ecbrDepartment.description) {
      description = ecbrDepartment.description;
    }

    if (ecbrDepartment && ecbrDepartment.departments && ecbrDepartment.departments.length > 0) {
      departments = ecbrDepartment.departments;
    }

    item.name = name;
    item.description = description;
    item.barcode = barcode;
    item.price = product.preco;
    item.lastPrice = product.preco;
    item.company = product.company;
    item.images = images;
    item.keywords = keywords;
    item.department = departments
    item.copyright = copyright;

    if (product.precoPromocao) {
      item.pricePromotion = product.precoPromocao;
      item.lastPrice = product.precoPromocao;
    }

    if (product.departamentos && departments.length <= 0) {
      item.department = product.departamentos;
    }

    if (product.ativo) {
      item.active = Boolean(product.ativo);
    } else {
      item.active = false;
    }

    item.updatePrice = moment().utc().toDate();
    item = validItem(product, item);

    await Product.create(item);
    sincronizados.push(product);
    // console.log('Produto Criado e sincronizado');
  } catch (err) {
    // console.log('Fail Add Sinc', err);
    naoSincronizado.push(product);
  }
};

const updateProduct = async (product, productCad) => {
  try {
    let item = {};
    let removeItem = {};
    item.barcode = getBarcode(product.codigoBarra);

    let ecbrDepartment = await EcbrDepartment.findOne({
      barcode: item.barcode,
    }).lean();

    if (ecbrDepartment && ecbrDepartment._id) {
      item.existImageBank = true;
    } else if (!ecbrDepartment && productCad.idImageBank) {
      ecbrDepartment = await EcbrDepartment.findById(productCad.idImageBank).lean();
      item.existImageBank = true;
    } else {
      item.existImageBank = false;
    }

    // Atualizar Imagens
    if (
      productCad && (!productCad.images || productCad.images.length <= 0) &&
      ecbrDepartment && ecbrDepartment.images && ecbrDepartment.images.length > 0
    ) {
      item.images = ecbrDepartment.images;
      item.copyright = false;
      if (ecbrDepartment.copyright) {
        item.copyright = true;
      }
    }

    // atualizar nome
    if (ecbrDepartment && ecbrDepartment.name) {
      item.name = ecbrDepartment.name;
    }

    // Atualizar palavras-chaves
    if (ecbrDepartment && ecbrDepartment.keywords) {
      item.keywords = ecbrDepartment.keywords;
    }

    item.price = product.preco;
    if (product.precoPromocao) {
      item.pricePromotion = product.precoPromocao;
    } else {
      removeItem.pricePromotion = "";
    }

    if (ecbrDepartment && ecbrDepartment.departments && ecbrDepartment.departments.length > 0) {
      item.department = ecbrDepartment.departments;
    } else if (product.departamentos) {
      item.department = product.departamentos;
    }

    if (product.precoPromocao && product.precoPromocao > 0) {
      if (product.inicioOferta && product.fimOferta) {
        item.pricePromotion = product.precoPromocao;
        item.dateInitPricePromotion = product.inicioOferta;
        item.dateFinishPricePromotion = product.fimOferta;
      } else {
        removeItem.pricePromotion = "";
        removeItem.dateInitPricePromotion = "";
        removeItem.dateFinishPricePromotion = "";
      }
    } else {
      removeItem.pricePromotion = "";
      removeItem.dateInitPricePromotion = "";
      removeItem.dateFinishPricePromotion = "";
    }

    if (product.ativo) {
      item.active = Boolean(product.ativo);
    } else {
      item.active = false;
    }

    item.updatePrice = moment().utc().toDate();

    if (productCad.pricePromotion && productCad.pricePromotion > 0) {
      item.lastPrice = productCad.pricePromotion;
    } else if (productCad.price >= 0) {
      item.lastPrice = productCad.price;
    }

    item = validItem(product, item);

    await Product.findOneAndUpdate(
      {
        _id: productCad._id
      },
      {
        $set: item,
        $unset: removeItem
      },
      {
        upsert: true,
        new: true
      }
    );

    sincronizados.push(product);
    // console.log('Produto Atualizado e sincronizado');
  } catch (err) {
    // console.log('Fail Sinc', err);
    naoSincronizado.push(product);
  }
}

const validItem = (product, item) => {
  try {
    if (!product.preco || product.preco <= 0) {
      item.active = false;
      item.problemSituation = 'WORTHLESS_PRODUCT'
      return item;
    }

    if (!product.codigoBarra) {
      item.active = false;
      item.problemSituation = 'INVALID_BAR_CODE'
      return item;
    }

    return item;
  } catch (err) {
    return item;
  }
}

const getBarcode = (barcode) => {
  try {
    let totalZero = 0;
    let disableSum = false;
    let strBarcode = barcode;

    Array.prototype.map.call(barcode, (char) => {
      if (char == 0 && disableSum === false) {
        totalZero += 1;
      } else if (char != 0) {
        disableSum = true;
      }
    });

    if (totalZero >= 2 && totalZero <= 5) {
      strBarcode = barcode.substring(totalZero)
    }

    return strBarcode.trim();
  } catch (err) {
    return barcode;
  }
}

module.exports = { sync };
