/** Model */
const ChatRaceModel = require("../../../models/Mobility/Messages/chatRaceModel");
const PassengerModel = require("../../../models/Mobility/Passenger/PassengerModel");
const DriverModel = require("../../../models/Mobility/Driver/DriverModel");
const LogModel = require("../../../models/LogModel");

/** Service */
const database = require("../../../services/firebase");
const apiPushNotification = require("../../../services/notification");

const createController = async (request, reply) => {
  try {
    const data = request.body;

    const response = await ChatRaceModel.create(data);

    if (response && response._id) {
      // enviar notificação e registrar no Firebase
      await realTimeMessage(data.booking.toString(), {
        sent: data.sent,
        driver: data.driver.toString(),
        passenger: data.passenger.toString(),
        booking: data.booking.toString(),
        createdAt: response.createdAt.toString(),
      });

      // Passenger
      if (response.sent === "passenger") {
        const driver = await DriverModel.findById(data.driver).lean();

        if (driver && driver.token) {
          await sendPushNotification(driver.token);
        }
      }

      // Driver
      if (response.sent === "driver") {
        const passenger = await PassengerModel.findById(data.passenger).lean();

        if (passenger && passenger.token) {
          await sendPushNotification(passenger.token);
        }
      }
    }

    return reply.send(response);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/chatMessage/createController.js',
      error: err?.message,
      method: 'createController',
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
      message: "Falha ao receber mensagem",
      err: err.message,
    });
  }
};

const realTimeMessage = async (booking, params) => {
  try {
    await database.ref().child(`${process.env.FIREBASE_PATH}chatRace/${booking}`).set(params);
  } catch (err) {
    console.log("err realTimeNotifyUser", err);
  }
};

// Push
const sendPushNotification = async token => {
  try {
    await apiPushNotification.post(`/v1/app-notification/user/${token}`, {
      user: {
        message: "Nova Mensagem",
        auth: token,
      },
      params: {
        title: "Mensagem",
        message: "Nova Mensagem",
      },
    });
  } catch (err) {
    console.log("err sendPushNotification", err);
  }
};

module.exports = createController;
