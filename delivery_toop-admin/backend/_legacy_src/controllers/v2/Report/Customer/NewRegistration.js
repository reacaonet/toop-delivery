/* LIBS */
const moment = require('moment');

/* Model */
const Customer = require('../../../../models/CustomerModel');
const LogModel = require('../../../../models/LogModel');

/** Util */
const Util = require('../../../../utils');

/**
 * Url - /v2/report/customer/new-registration
 */
const newRegistrations = async (req, res) => {
  try {
    let timezone = 'America/Sao_Paulo';

    if (req.query.hasOwnProperty('timezone')) {
      timezone = Number(req.query.timezone);
    }

    let lte = Util.getDate().toDate();
    let gte = Util.getDate(30).toDate();

    const list = await Customer.aggregate([
      {
        $match: {
          createdAt: {
            $gte: gte,
            $lte: lte
          }
        }
      },
      {
        $group: {
          _id: {
            month: {
              $month: {
                date: "$createdAt",
                timezone: timezone,
              },
            },
            day: {
              $dayOfMonth: {
                date: "$createdAt",
                timezone: timezone,
              },
            },
            year: {
              $year: {
                date: "$createdAt",
                timezone: timezone,
              },
            },
          },
          total: { $sum: 1 },
        }
      },
      {
        $sort: {
          '_id.year': -1,
          '_id.month': -1,
          '_id.day': -1,
        },
      }
    ]);

    const listDaysFinal = [];
    let dayBeforeLoop = moment(`${list[0]?._id?.year}-${list[0]?._id?.month}-${list[0]?._id?.day}`, 'YYYY-M-D').format('DD');
    for await (let item of list) {
      const dayLoop = moment(`${item?._id?.year}-${item?._id?.month}-${item?._id?.day}`, 'YYYY-M-D').format('DD');
      const monthLoop = moment(item?._id?.month, 'M').format('MM');

      let securityCounter = 30;
      while (dayLoop !== dayBeforeLoop && securityCounter >= 0) {
        listDaysFinal.push({
          year: item?._id?.year,
          month: monthLoop,
          day: dayBeforeLoop,
          total: 0
        })
        dayBeforeLoop = moment(`${item?._id?.year}-${item?._id?.month}-${dayBeforeLoop}`, 'YYYY-M-DD').subtract(1, 'day').format('DD');
        securityCounter--;
      }

      if (dayLoop == dayBeforeLoop) {
        dayBeforeLoop = moment(`${item?._id?.year}-${item?._id?.month}-${item?._id?.day}`, 'YYYY-M-D').subtract(1, 'day').format('DD');
        listDaysFinal.push({
          year: item?._id?.year,
          month: monthLoop,
          day: dayLoop,
          total: item?.total
        })
      }
    }

    return res.status(200).send(listDaysFinal);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Report/Customer/NewRegistration.js',
      error: err?.message,
      method: 'newRegistrations',
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
      message: 'Não foi possível listar dados',
      err: err.message,
    });
  }
};

module.exports = newRegistrations;
