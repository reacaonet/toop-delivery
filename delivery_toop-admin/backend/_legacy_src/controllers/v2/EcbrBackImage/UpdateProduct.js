const EcbrImageBank = require('../../../models/ProductDepartment/EcbrProductDepartment');
const ProductModel = require('../../../models/ProductModel');
const LogModel = require("../../../models/LogModel");

const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    if (!data.departments || typeof data.departments !== "object" || data.departments.length <= 0) {
      return res.status(400).send({
        message: 'Informe pelo menos uma departamento'
      });
    }

    data.status = (
      ((typeof data.status === 'string') && data.status === "") ||
      (data.status === null)
    ) ? false : data.status;

    data.images = [];
    if (Array.isArray(data.file)) {
      data.file.forEach(item => data.images.push(item.url));
    } else if (data.url) {
      data.images = [];
      data.images.push(data.url)
    }

    if (!data.file || (typeof data.file !== 'object')) {
      delete data.file;
      delete data.images;
    }

    const novoRegistro = await EcbrImageBank.findOneAndUpdate({
      _id: id
    }, data, {
      upsert: true,
      new: true
    })

    let payloadProduct;
    if (data.images) {
      payloadProduct = {
        name: data.name,
        images: data.images,
        department: data.departments,
      };
    } else {
      payloadProduct = {
        name: data.name,
        department: data.departments,
      };
    }

    // ProductModel
    if (data.audited && data.audited === true) {
      const prodUpdate = await ProductModel.updateMany({
        barcode: String(data.barcode),
        pauseSync: {
          $ne: true,
        },
      }, {
        $set: payloadProduct
      });
      return res.send({
        status: 200,
        message: `Produto atualizada com sucesso e mais ${prodUpdate.nModified} nos produtos do supermercado online`,
        data: novoRegistro
      });
    }

    return res.send({
      status: 200,
      message: `Produto atualizada com sucesso!`,
      data: novoRegistro
    });

  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/EcbrBackImage/UpdateProduct.js',
      error: err?.message,
      method: 'updateProduct',
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

    console.log(err);
    return res.status(400).send({
      message: "Falha ao atualizar Produto",
      Error: err.message
    });
  }
};

module.exports = updateProduct
