const mongoose = require("mongoose");

const CustomerModel = require("../../../models/CustomerModel");
const NotificatonModel = require("../../../models/NotificationModel");
const FranchiseModel = require("../../../models/Franchise/FranchiseModel");
const LogModel = require("../../../models/LogModel");

/** Service */
const notificationApi = require("../../../services/notification");

const tokenNotificaton = "lwqZm4QBCbFNFiS";

const sendNotification = async (req, res) => {
  try {
    const { title, message, allUser, listUser, token } = req.body || {};
    const { isRoot, franchise } = req;

    const users = [];
    const filter = {};
    let filterLocation = {};

    if (!token || token !== tokenNotificaton) {
      return res.status(400).send({
        message: "Informe um token válido",
      });
    }

    if (!title) {
      return res.status(400).send({
        message: "Informe um título",
      });
    }

    if (!message) {
      return res.status(400).send({
        message: "Informe uma mensagem",
      });
    }

    if (title.length > 25) {
      return res.status(400).send({
        message: "O Titulo deve conter até 25 caracteres",
      });
    }

    if (message.length > 200) {
      return res.status(400).send({
        message: "A Mensagem deve conter até 200 caracteres",
      });
    }

    if (`${allUser}` === "false" && (!Array.isArray(listUser) || listUser.length <= 0)) {
      return res.status(400).send({
        message: "Informe uma lista de usuários",
      });
    }

    if (`${allUser}` === "false") {
      listUser.map(item => {
        users.push(mongoose.Types.ObjectId(item._id));
      });

      if (users && users.length > 0) {
        filter._id = {
          $in: users,
        };
      }
    }

    filter.token = {
      $exists: true,
    };

    if (!isRoot) {
      const respFranchise = await FranchiseModel.findOne({
        _id: franchise,
      })
        .populate("SettingCity")
        .select({
          city: 1,
          location: 1,
          SettingCity: 1,
        })
        .lean();

      if (respFranchise && respFranchise.city && respFranchise.city.latitude && respFranchise.city.longitude) {
        filterLocation["deliveryAddress.location"] = {
          $geoWithin: {
            $centerSphere: [[Number(respFranchise.city.longitude), Number(respFranchise.city.latitude)], Number(16 / 3963.2)],
          },
        };
      } else if (respFranchise.location) {
        filterLocation["deliveryAddress.location"] = {
          $geoWithin: {
            $centerSphere: [
              [Number(respFranchise.location.coordinates[0]), Number(respFranchise.location.coordinates[1])],
              Number(process.env.maxMiles / 3963.2),
            ],
          },
        };
      } else {
        filterLocation["deliveryAddress.location"] = {
          $geoWithin: {
            $centerSphere: [[Number(0), Number(0)], Number(500 / 3963.2)],
          },
        };
      }
    }

    const list = await CustomerModel.aggregate([
      { $match: filter },
      {
        $project: {
          _id: 1,
          token: 1,
        },
      },
      {
        $lookup: {
          from: "customer_delivery_address",
          let: { customer: "$_id" },
          as: "deliveryAddress",
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$customer", "$$customer"],
                },
                main: true,
                isDeleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                location: 1,
              },
            },
            { $limit: 1 },
          ],
        },
      },
      {
        $unwind: { path: "$deliveryAddress", preserveNullAndEmptyArrays: true },
      },
      {
        $match: filterLocation,
      },
    ]);

    if (!list || list.length <= 0) {
      return res.status(400).send({
        message: "Nenhum usuário encontrado para envio de mensagem",
      });
    }

    const payload = {
      title: title,
      message: message,
      type: "customer",
      users: users,
      totalUsers: list.length,
    };

    if (!isRoot) {
      payload.franchise = franchise;
    }

    const createNotification = await NotificatonModel.create(payload);
    sendMessages(list, title, message);

    return res.status(200).send(createNotification);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Notification/Customer/sendNotification.js',
      error: err?.message,
      method: 'sendNotification',
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

    console.log("err", err);

    return res.status(400).send({
      message: "Não foi possível enviar notificação",
      err: err.message,
    });
  }
};

const sendMessages = async (users, title, message) => {
  try {
    for (const user of users) {
      const { data: resp } = await notificationApi.post(`/v1/app-notification/user/${user.token}`, {
        user: {
          auth: user.token,
          message: message,
          params: {
            title: title,
            message: message,
          },
        },
      });
    }
  } catch (err) {
    await LogModel.create({
      path: '',
      error: err?.message,
      method: '',
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

    console.log("Fail sendMessages", err);
  }
};

module.exports = sendNotification;
