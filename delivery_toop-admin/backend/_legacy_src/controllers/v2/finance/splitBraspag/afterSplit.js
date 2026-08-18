const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

/** Model */
const UserModel = require('../../../../models/UserModel');
const LogModel = require("../../../../models/LogModel");

/** Service */
const paymentApi = require('../../../../services/paymentApi');

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {req.body.payload}
 * - "payload": [
        {
            "subordinateId": "98455030-4f7e-4af0-82de-c2e6c245a238",
            "amount": 20.5,
            "mdr": 1,
            "fee": 0
        }
    ]
 */
const afterSplit = async (req, res) => {
  try {
    const { total, idUser, password, payload } = req.body;

    const { PaymentId } = req.params;

    if (!PaymentId) {
      return res.status(400).send({
        message: 'Informe um PaymentId da Braspag'
      });
    }

    if (!idUser || !password || !mongoose.isValidObjectId(idUser)) {
      return res.status(400).send({
        message: 'Informe os dados do usuário'
      });
    }


    if (!payload) {
      return res.status(400).send({
        message: 'Informe as informações para divisão'
      });
    }

    if (!total || total <= 0) {
      return res.status(400).send({
        message: 'Informe o valor total da compra'
      });
    }

    let user = await UserModel.findOne({
      _id: idUser,
      status: true,
    }).lean();

    if (!user || !user._id) {
      return res.status(400).send({
        message: 'Usuário não encontrado ou não autorizado',
      });
    }

    // let passwordOK = await bcrypt.compare(password, user.password)
    // if( passwordOK === false ) {
    //   return res.status(400).send({
    //     message: 'Usuário não encontrado ou não autorizado',
    //   });
    // }

    // Password Default
    if (!password || password !== 'duW34AoMdf185673') {
      return res.status(400).send({
        message: 'Usuário não encontrado ou não autorizado',
      });
    }

    const { data: response } = await paymentApi.post(`/split/after/${PaymentId}`, {
      total,
      payload
    });

    return res.status(200).send(response);

  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/finance/splitBraspag/afterSplit.js',
      error: err?.message,
      method: 'afterSplit',
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

    let data = err.message;
    if (err.response && err.response.data) {
      data = err.response.data;
    }

    return res.status(400).send({
      message: 'Não foi possível processar informação',
      err: data,
    });
  }
};

module.exports = afterSplit;
