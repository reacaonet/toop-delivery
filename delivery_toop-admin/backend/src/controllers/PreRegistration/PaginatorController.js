const mongoose = require("mongoose");
const PreRegistrationModel = require("../../models/PreRegistration/PreRegistrationModel");
const LogModel = require("../../models/LogModel");

const PaginatorController = async (request, reply) => {
  try {
    const filter = {};
    const { pageIn, pageOut, email, name, cpf, phone, status } = request.query;
    const { isRoot, franchise } = request;

    if (!isRoot) {
      filter.franchise = mongoose.Types.ObjectId(franchise);
    }

    if (email) {
      filter.email = {
        $regex: ".*" + email.toLowerCase() + ".*",
        $options: "i",
      };
    }

    if (name) {
      filter.name = {
        $regex: ".*" + name.toLowerCase() + ".*",
        $options: "i",
      };
    }

    if (cpf) {
      filter.cpf = {
        $regex: ".*" + cpf + ".*",
        $options: "i",
      };
    }

    if (phone) {
      filter.phone = {
        $regex: ".*" + phone.toLowerCase() + ".*",
        $options: "i",
      };
    }

    if (status && status !== "ALL") {
      filter.status = status;
    }

    filter.deletedAt = {
      $exists: false,
    };

    if (franchise && mongoose.Types.ObjectId.isValid(franchise)) {
      filter.franchise = franchise;
    }

    let list;

    if (pageIn && pageOut) {
      list = await PreRegistrationModel.find(filter)
        .populate("franchise")
        .limit(parseInt(pageOut, 10))
        .skip(parseInt(pageIn, 10) * parseInt(pageOut, 10))
        .sort({ createdAt: -1 });

      const numTotal = await PreRegistrationModel.find(filter).countDocuments();

      return reply.send({ list, total: numTotal });
    }

    // list = await PreRegistrationModel.find(filter);

    return reply.send([]);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/PreRegistration/PaginatorController.js',
      error: err?.message,
      method: 'PaginatorController',
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

    return reply.status(400).send({
      message: "Falha ao encontrar Paginação",
      err: err.message,
    });
  }
};

module.exports = PaginatorController;
