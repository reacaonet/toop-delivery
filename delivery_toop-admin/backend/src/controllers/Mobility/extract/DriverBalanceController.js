/* eslint-disable prefer-const */
const { Types } = require("mongoose");
const moment = require("moment");

/** Model */
const BookingModel = require("../../../models/Mobility/Booking/BookingModel");
const LogModel = require("../../../models/LogModel");

const driverBalanceController = async (request, reply) => {
  try {
    const { driver } = request.params || {};
    const { timezone = "America/Sao_Paulo" } = request.query || {};

    const filter = {};

    filter.driver = new Types.ObjectId(driver);
    filter.status = "concluded";

    // last months - createdAt
    const dataOld = moment().utc(false).subtract(1, "months").startOf("months").toDate();

    filter.createdAt = {
      $gte: dataOld,
    };

    const list = await BookingModel.aggregate([
      {
        $match: filter,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $project: {
          price: 1,
          createdAt: 1,
          year: {
            $dateToString: {
              date: "$createdAt",
              format: "%Y",
              timezone: timezone,
            },
          },
          month: {
            $dateToString: {
              date: "$createdAt",
              format: "%m",
              timezone: timezone,
            },
          },
          day: {
            $dateToString: {
              date: "$createdAt",
              format: "%d",
              timezone: timezone,
            },
          },
        },
      },
    ]);

    let groupList = [];

    for await (const item of list) {
      if (!groupList[`${item.year}-${item.month}`]) {
        groupList[`${item.year}-${item.month}`] = [];
      }

      groupList[`${item.year}-${item.month}`].push({
        ...item,
        monthTxt: getMonth(item.month),
      });
    }

    return reply.send({ ...groupList });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/extract/DriverBalanceController.js',
      error: err?.message,
      method: 'driverBalanceController',
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
      message: "Não foi possível avaliar",
      err: err.message,
    });
  }
};

const getMonth = month => {
  switch (month) {
    case "01":
      return "Janeiro";
    case "02":
      return "Fevereiro";
    case "03":
      return "Março";
    case "04":
      return "Abril";
    case "05":
      return "Maio";
    case "06":
      return "Junho";
    case "07":
      return "Julho";
    case "08":
      return "Agosto";
    case "09":
      return "Setembro";
    case "10":
      return "Outubro";
    case "11":
      return "Novembro";
    case "12":
      return "Dezembro";
    default:
      return "";
  }
};

module.exports = driverBalanceController;
