const mongoose = require('mongoose')

/** Model */
const FranchiseModel = require('../../../../models/Franchise/FranchiseModel');
const CompanyModel = require('../../../../models/Company/CompanyModel')
const GroupModel = require('../../../../models/GroupModel')
const CompanyDelivery = require('../../../../models/Company/CompanyDeliveryModel')
const LogModel = require("../../../../models/LogModel");

/**
 * Registro publico de empresa
 * @param {*} req
 * @param {*} res
 */
const registerCompany = async (req, res) => {
  try {
    const data = req.body

    if (!data.franchise) {
      return res.status(400).send({
        message: 'Informe a Franquia'
      })
    }

    if (!data.file || typeof data.file !== "object") {
      return res.status(400).send({
        message: "Imagens inválidas",
      });
    }

    if (!data.lng || !data.lat) {
      return res.status(400).send({
        message: "Campos 'latitude' e 'longitude' são obrigatórios",
      });
    }

    if (!data.name || typeof data.name !== 'string') {
      return res.status(400).send({
        message: 'Nome inválido'
      })
    }

    data.location = {
      type: "Point",
      coordinates: [Number(data.lng), Number(data.lat)],
    };

    data.images = [];

    if (Array.isArray(data.file)) {
      data.file.forEach((item) => data.images.push(item.url));
    } else if (data.url) {
      data.images.push(data.url);
    }

    if (data.category) {
      data.category = data.category
        .toLocaleString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split(",");
    }

    const group = await createGroup(data)
    if (!group) {
      return res.status(400).send({
        message: 'Não conseguimos criar um grupo para esta empresa...'
      })
    }

    data._id = new mongoose.Types.ObjectId().toHexString();
    data.groups = [group._id]
    data.approved = false
    data.status = false

    const company = await CompanyModel.create(data)

    if (company) {
      await createCompanyDelivery(company)
    }

    return res.status(200).send(company);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Company/Public/registerCompany.js',
      error: err?.message,
      method: 'registerCompany',
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
      message: 'Não foi possível registrar empresa'
    })
  }
}

const createGroup = async (data) => {
  try {
    return await GroupModel.create({
      franchise: data.franchise,
      name: data.name,
      description: data.description ? data.description : data.name,
      status: true,
      images: data.images
    })
  } catch (err) {
    console.log('Falha ao criar grupo', err)
    return null
  }
}

const createCompanyDelivery = async (company) => {
  try {
    const delivery = await CompanyDelivery.create({
      company: company._id,
      fee: 15,
      min_purchase: 20,
      max_amount_items: 20,
      distance: [
        {
          min: 0,
          max: 10000,
          price: 10,
          delivery_time: 25
        }
      ]
    })

    if (delivery && delivery._id) {
      await CompanyModel.updateOne({ _id: company._id }, {
        companyDelivery: delivery._id
      })
    }

    return delivery
  } catch (err) {
    console.log('Falha ao criar company delivery', err)
    return null
  }
}

module.exports = registerCompany
