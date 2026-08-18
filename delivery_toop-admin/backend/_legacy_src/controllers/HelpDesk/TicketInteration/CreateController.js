const mongoose = require("mongoose");

const ticketModel = require("../../../models/HelpDesk/TicketsModel");
const TicketInteration = require("../../../models/HelpDesk/TicketInterationModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const data = req.body;
    data._id = new mongoose.Types.ObjectId().toHexString();

    if (!data.ticket_id || !mongoose.isValidObjectId(data.ticket_id)) {
      return res.status(400).send({
        message: "Informe um Ticket válido",
      });
    }

    let ticketInteration = await TicketInteration.create({
      helpTicketsId: data.ticket_id,
      origin: data.origin,
      description: data.description,
      author: data.author,
    }).catch(err => console.log("Erro ao criar interação", err));

    ticket = await ticketModel
      .findOne({ _id: mongoose.Types.ObjectId(data.ticket_id) })
      .populate("company", { name: 1 })
      .populate("person", { name: 1, email: 1 })
      .lean();

    return res.send({
      status: 200,
      message: "Interação criada com sucesso",
      data: ticketInteration,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/HelpDesk/TicketInteration/CreateController.js',
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
      message: "Falha ao criar interação",
      Error: dadosDoErro,
    });
  }
};
