const mongoose = require("mongoose");
const mailer = require("../../../config/nodemailer");
// const SendImages = require("../../../services/sendImages");
const ticketModel = require("../../../models/HelpDesk/TicketsModel");
const ticketInteration = require("../../../models/HelpDesk/TicketInterationModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { tickedId, company, status, images, subject, description, person, priority, department, name, email, phone, order } = req.body;

    let imagesUp;
    const _id = new mongoose.Types.ObjectId().toHexString();

    if (company && !mongoose.isValidObjectId(company)) {
      return res.status(400).send({
        message: "Informe uma Company válido",
      });
    }

    let ticket = await ticketModel
      .create({
        _id,
        tickedId,
        company,
        status,
        images: imagesUp,
        subject,
        description,
        person,
        priority,
        department,
        name,
        email,
        phone,
        order,
      })
      .catch(err => console.log("Erro ao criar", err));

    ticket = await ticketModel.findOne({ _id: ticket._id }).populate("company", { name: 1 }).populate("person", { name: 1, email: 1 }).lean();

    await ticketInteration
      .create({
        helpTicketsId: ticket._id,
        origin: name ? "user" : "company",
        description: ticket.description,
        author: name ? name : ticket.company && ticket.company.name ? ticket.company.name : "",
      })
      .catch(err => console.log("Erro ao criar interação", err));

    return res.send({
      status: 200,
      message: "Tickets criado com sucesso",
      data: ticket,
    });
  } catch (dadosDoErro) {
  await LogModel.create({
    path: 'src/controllers/HelpDesk/Tickets/CreateController.js',
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
      message: "Falha ao criar tickets",
      Error: dadosDoErro,
    });
  }
};
