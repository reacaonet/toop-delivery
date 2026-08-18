const mongoose = require("mongoose");

const ticketModel = require("../../../models/HelpDesk/TicketsModel");
const ticketInterationModel = require("../../../models/HelpDesk/TicketInterationModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const protocol = req.params.protocol;

    const list = await ticketModel
      .findOne({
        tickedId: protocol,
      })
      .populate("company", {
        name: 1,
      })
      .populate("person", {
        name: 1,
      })
      .lean();

    // --> obtem as interacaoes
    const interactions = await ticketInterationModel.find({ helpTicketsId: list._id }).sort({ createdAt: -1 });

    return res.json({ ...list, interactions: interactions });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/HelpDesk/Tickets/ProtocolController.js',
    error: dadosDoErro?.message,
    method: 'ProtocolController',
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
      message: "Falha ao encontrar Protocolo",
      Error: dadosDoErro,
    });
  }
};
