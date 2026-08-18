const mongoose = require("mongoose");

const EcbrProductImageModel = require('../../../models/ProductDepartment/EcbrProductDepartment');
const ProductModel = require('../../../models/ProductModel');
const LogModel = require("../../../models/LogModel");

const create = async (req, res) => {
  try {
    const {
      name, barcode, description, file, url, keywords, departments, status, audited
    } = req.body

    if (!file || (typeof file !== 'object')) {
      return res.status(400).send({
        message: 'Imagens inválidas'
      });
    }

    if (!name) {
      return res.status(400).send({
        message: 'Informe um nome'
      });
    }

    if (!barcode || typeof barcode !== 'string' || barcode.length <= 0) {
      return res.status(400).send({
        message: 'Informe um código de barra'
      });
    }

    if (!description) {
      return res.status(400).send({
        message: 'Informe uma descrição'
      });
    }

    if (!keywords || typeof keywords !== "object" || keywords.length <= 0) {
      return res.status(400).send({
        message: 'Informe pelo menos uma palavra chave'
      });
    }

    if (!departments || typeof departments !== "object" || departments.length <= 0) {
      return res.status(400).send({
        message: 'Informe pelo menos uma departamento'
      });
    }

    let data = req.body

    data.images = [];
    if (Array.isArray(file)) {
      file.forEach(item => data.images.push(item.url));
    } else if (url) {
      data.images.push(url)
    }

    if (`${status}` === 'true') {
      data.status = true;
    } else if (`${status}` === 'false') {
      data.status = false;
    }

    let response = await EcbrProductImageModel.create(req.body)
      .catch((err) => {
        return res.status(400).send({
          message: 'Falha ao cadastrar item',
          err: err.message,
        });
      });

    if (!response) {
      return res.status(400).send({
        message: 'Falha ao cadastrar produto',
      });
    }

    // Atualiza os produtos já existentes, através do código de barras
    const listDepartments = departments.map((item) => {
      return mongoose.Types.ObjectId(item._id)
    });

    const payloadProduct = {
      name: data.name,
      keywords: data.keywords,
      images: data.images,
      department: listDepartments,
      existImageBank: true,
    };

    // ProductModel
    if (data.audited && data.audited === true) {
      await ProductModel.updateMany({
        barcode: String(barcode),
        pauseSync: {
          $ne: true,
        },
      }, {
        $set: payloadProduct
      });
    }

    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/EcbrBackImage/CreateController.js',
      error: err?.message,
      method: 'create',
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
      message: 'Falha ao cadastrar item',
      err: err.message,
    });
  }
}

module.exports = create;
