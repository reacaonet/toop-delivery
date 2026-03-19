const firebaseAdmin = require("../../../services/firebase/firebaseAdmin");
const { getMessaging } = require("firebase-admin/messaging");

/** Model */
const DriverModel = require("../../../models/Mobility/Driver/DriverModel");
const PassengerModel = require("../../../models/Mobility/Passenger/PassengerModel");
const LogModel = require("../../../models/LogModel");

module.exports = async (request, res) => {
  try {
    const app = await firebaseAdmin();

    if (!app) {
      return res.status(400).send({
        message: "verifique as configurações ...",
      });
    }

    const driverList = await DriverModel.aggregate([
      {
        $match: {
          franchise: { $exists: true },
          token: { $exists: true },
          deletedAt: { $exists: false },
          $or: [{ topics: { $exists: false } }, { topics: { $eq: [] } }],
        },
      },
      {
        $project: {
          _id: 1,
          franchise: 1,
          token: 1,
        },
      },
      // {
      //   $limit: 1,
      // },
    ]);

    const driverErr = await addUsersToTopic(driverList, "driver", DriverModel, app);

    const passengerList = await PassengerModel.aggregate([
      {
        $match: {
          franchise: { $exists: true },
          token: { $exists: true },
          deletedAt: { $exists: false },
          $or: [{ topics: { $exists: false } }, { topics: { $eq: [] } }],
        },
      },
      {
        $project: {
          _id: 1,
          franchise: 1,
          token: 1,
        },
      },
      // {
      //   $limit: 1,
      // },
    ]);

    const passengerErr = await addUsersToTopic(passengerList, "passenger", PassengerModel, app);

    return res.send({
      driverErr: driverErr,
      passengerErr: passengerErr,
    });
  } catch (err) {
    await LogModel.create({
      path: "src/controllers/Mobility/Topic/LinkController.js",
      error: err?.message,
      method: "LinkController",
      type: "error",
      level: 0,
      origin: "backend",
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

    return res.status(400).send({
      message: "Falha ao criar registro",
      err: err.message,
    });
  }
};

async function addUsersToTopic(users, mainTopic, userModel, firebaseApp) {
  const userErrors = [];

  if (!mainTopic) {
    return users.map(user => user._id);
  }

  if (users && Array.isArray(users) && users.length > 0) {
    for await (const user of users) {
      try {
        if (Array.isArray(user.topics) && user.topics.length > 0) {
          continue;
        }

        await addUserToTopic(user, mainTopic, userModel, firebaseApp);
      } catch (err) {
        userErrors.push(user._id);
      }
    }
  }

  return userErrors;
}

async function addUserToTopic(user, mainTopic, userModel, firebaseApp) {
  if (firebaseApp == null) {
    firebaseApp = await firebaseAdmin();
  }

  await getMessaging(firebaseApp).subscribeToTopic(user.token, mainTopic);

  await getMessaging(firebaseApp).subscribeToTopic(user.token, `application_root`);

  await getMessaging(firebaseApp).subscribeToTopic(user.token, `franchise_${user.franchise}`);

  await userModel.updateOne(
    { _id: user._id },
    {
      topics: [mainTopic, `application_root`, `franchise_${user.franchise}`],
    },
  );
}

async function removeUserFromTopic(user, mainTopic, userModel, firebaseApp) {
  try {
    if (firebaseApp == null) {
      firebaseApp = await firebaseAdmin();
    }

    if (!user || !user?.token) {
      return;
    }

    await getMessaging(firebaseApp).unsubscribeFromTopic(user.token, mainTopic);
    await getMessaging(firebaseApp).unsubscribeFromTopic(user.token, `application_root`);
    await getMessaging(firebaseApp).unsubscribeFromTopic(user.token, `franchise_${user.franchise}`);

    await userModel.updateOne({ _id: user._id }, { $unset: { topics: 1 } });
  } catch (err) {
    return;
  }
}

module.exports.addUserToTopic = addUserToTopic;
module.exports.removeUserFromTopic = removeUserFromTopic;
