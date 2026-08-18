const mongoose = require("mongoose");
const UserModel = require("../../models/UserModel");
const ShopperModel = require("../../models/ShopperModel");
const LogModel = require("../../models/LogModel");

const updateToken = async (req, res) => {
  try {
    const id = req.params.id;
    let { token } = req.body;

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).send({
        message: "Informe um usuário",
      });
    }

    if (!token) {
      return res.status(400).send({
        message: "Informe o payload completo",
      });
    }

    const user = await UserModel.findById(id).lean();
    if (!user || !user._id) {
      return res.status(400).send({
        message: "Informe um usuário",
      });
    }

    await UserModel.updateOne(
      { _id: id },
      {
        token: token,
      },
    );

    await ShopperModel.updateOne(
      { person: user.person },
      {
        token: token,
      },
    );

    return res.status(200).send({
      message: "Informações atualizadas",
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/User/updateToken.js',
      error: err?.message,
      method: 'updateToken',
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
      message: "Não foi possível atualizar",
      err: err.message,
    });
  }
};

module.exports = updateToken;
