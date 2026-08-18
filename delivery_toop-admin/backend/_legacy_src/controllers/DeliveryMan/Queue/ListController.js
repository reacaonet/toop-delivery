const moment = require("moment");
const QueueModel = require("../../../models/DeliveryMan/QueueDeliveryManModel");
const LogModel = require("../../../models/LogModel");

const statusOne = async (req, res) => {
  try {
    const { status } = req.params;
    const { initial } = req.query;
    let filter = {};

    if (!status) {
      return res.status(400).send({
        message: "Informe um Status",
      });
    }

    filter.status = status;

    // Primeira vez sem vinculo
    if (initial && initial.toString() === "true") {
      filter.attempt = { $eq: 0 };
      filter.$or = [{ lastData: { $exists: false } }, { lastData: { $eq: null } }];
    }

    // o mais antigo
    const response = await QueueModel.findOne(filter)
      .populate({
        path: "company",
        select: {
          name: 1,
        },
      })
      .populate({
        path: "order",
        select: {
          customerDelivery: 1,
        },
        populate: {
          path: "customerDelivery",
          select: {
            location: 1,
          },
        },
      })
      .sort({
        createdAt: 1,
      })
      .lean();

    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/DeliveryMan/Queue/ListController.js',
      error: err?.message,
      method: 'statusOne',
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

    return res.status(200).send({
      message: "Falha ao buscar fila para serem processados",
      err: err.message,
    });
  }
};

const list = async (req, res) => {
  try {
    const limitDefault = 50;

    const { limit, status, sortData, dateLt, rangeAttempt, attemptGte, seconds, order } = req.query;

    let filter = {};
    let sort = {};
    let limitList = {};

    limitList = limitDefault;
    if (limit) {
      limitList = Number(limit.toString());
    }

    if (order) {
      filter.order = {
        $eq: order,
      };
    }

    if (status) {
      filter.status = status;
    }

    if (dateLt) {
      let date = moment(dateLt).utc(false).toDate();
      filter.lastData = { $lt: date };
      // filter.lastData = {$lt: new Date(date)} // enviar data com fuso horário
    }

    // nova regra - mantido a anterior para funcionar versões mais antigas
    if (seconds) {
      filter.lastData = {
        $lt: moment().utc(false).subtract(seconds, "seconds").toDate(),
      };
    }

    if (rangeAttempt) {
      let paramsRange = rangeAttempt.split(",", 2);
      if (paramsRange && typeof paramsRange && paramsRange.length > 0)
        filter.attempt = {
          $gte: paramsRange[0],
          $lt: paramsRange[1],
        };
    }

    if (attemptGte) {
      filter.attempt = {
        $gte: attemptGte,
      };
    }

    sort.createdAt = 1;
    if (sortData) {
      sort.createdAt = sortData;
    }

    const response = await QueueModel.find(filter)
      .populate({
        path: "company",
        select: {
          name: 1,
        },
      })
      .populate({
        path: "order",
        select: {
          customerDelivery: 1,
        },
        populate: {
          path: "customerDelivery",
          select: {
            location: 1,
          },
        },
      })
      .limit(limitList)
      .sort(sort)
      .lean();

    return res.status(200).send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/DeliveryMan/Queue/ListController.js',
      error: err?.message,
      method: 'list',
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

    // console.log('Err ', err);
    return res.status(400).send({
      message: "Fail process List",
      err: err.message,
    });
  }
};

module.exports = { statusOne, list };
