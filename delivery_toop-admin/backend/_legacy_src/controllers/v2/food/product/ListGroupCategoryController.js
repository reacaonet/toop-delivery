const mongoose = require("mongoose");
const moment = require("moment-timezone");
const Category = require("../../../../models/Food/CategoryModel");
const LogModel = require("../../../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const { company } = req.query;
    let { timezone = "America/Sao_Paulo" } = req.query;
    const appVersion = req.header("appVersion");

    if (!moment.tz.names().includes(timezone)) {
      timezone = "America/Sao_Paulo";
    }

    if (!company || (company && !mongoose.Types.ObjectId.isValid(company))) {
      return res.status(400).send({
        message: "Company inválida",
      });
    }

    const result = await Category.aggregate([
      { $match: { company: mongoose.Types.ObjectId(company), isPaused: { $ne: true } } },
      {
        $lookup: {
          from: "foodProduct",
          let: { id: "$_id" },
          as: "products",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$category", "$$id"] },
                deletedAt: { $exists: false },
                isPaused: { $ne: true },
              },
            },
            {
              $sort: {
                position: 1,
              },
            },
          ],
        },
      },
      {
        $sort: {
          position: 1,
        },
      },
    ]);

    let filter = result
      .filter(p => p.products.length > 0)
      .map(p => {
        // nesta regra somente o atual vai enviar a versão
        if (p.type === "PIZZAS") {
          return {
            title: p.name,
            key: p._id,
            products: p.products,
            type: p.type,
            data: p.sizes,
            dough: p.dough,
            edges: p.edges,
            billing_mode: p.billing_mode,
            alwaysAvailable: p.alwaysAvailable,
            daysOfWeek: p.daysOfWeek,
            availableHours: p.availableHours,
          };
        } else {
          // nesta regra somente o atual vai enviar a versão
          if (appVersion) {
            return {
              title: p.name,
              key: p._id,
              data: p.products,
              type: p.type,
              alwaysAvailable: p.alwaysAvailable,
              daysOfWeek: p.daysOfWeek,
              availableHours: p.availableHours,
            };
          } else {
            return {
              title: p.name,
              key: p._id,
              products: p.products, // Compatibilidade versao 1.5.9,
              type: p.type,
              alwaysAvailable: p.alwaysAvailable,
              daysOfWeek: p.daysOfWeek,
              availableHours: p.availableHours,
            };
          }
        }
      });

    // filter by day week and hours
    filter = getAvailable(filter, timezone);

    return res.json(filter);
  } catch (dadosDoErro) {
    await LogModel.create({
      path: "src/controllers/v2/food/product/ListGroupCategoryController.js",
      error: dadosDoErro?.message,
      method: "ListGroupCategoryController",
      type: "error",
      level: 0,
      origin: "backend",
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

    return res.status(400).send({
      message: "Falha ao encontrar Produto",
      Error: dadosDoErro,
    });
  }
};

function getAvailable(items, timezone) {
  const resultInternal = [];
  const currentHour = moment().tz(timezone);
  const currentDay = moment().tz(timezone).format("dddd").toLocaleLowerCase();

  const result = items.map(item => {
    if (item.alwaysAvailable === false && item.daysOfWeek) {
      let isDayWeek = item.daysOfWeek.find(day => `${day?.key}`.trim() === `${currentDay}`.trim() && day.available === true);
      if (isDayWeek) {
        let available = false;
        item.availableHours.map(i => {
          const start = moment(`${currentHour.format("YYYY-MM-DD")}T${i.start}:00${currentHour.format("Z")}`).tz(timezone);
          const end = moment(`${currentHour.format("YYYY-MM-DD")}T${i.end}:00${currentHour.format("Z")}`).tz(timezone);
          if (start.isBefore(currentHour) && end.isAfter(currentHour)) {
            available = true;
          }
        });

        if (available) {
          resultInternal.push(item);
        }
      }
    } else {
      resultInternal.push(item);
    }
  });

  return resultInternal;
}
