/** Model */
const EvaluationModel = require("../../../models/Mobility/Evaluation/EvaluationModel");
const PassengerModel = require("../../../models/Mobility/Passenger/PassengerModel");
const DriverModel = require("../../../models/Mobility/Driver/DriverModel");
const LogModel = require("../../../models/LogModel");

const createEvaluationController = async (request, reply) => {
  try {
    const { typeEvaluator, typeRated, idEvaluator, idRated, paymentDriver, stars, description = "" } = request.body || {};

    const evaluation = await EvaluationModel.create({
      typeEvaluator,
      typeRated,
      idEvaluator,
      idRated,
      paymentDriver,
      stars,
      description,
    });

    if (!evaluation || !evaluation._id) {
      return reply.status(400).send({
        message: "Não conseguimos registrar sua avalilação",
      });
    }

    if (typeEvaluator === "passenger") {
      await evaluationDriver(idRated, stars);
    }

    if (typeEvaluator === "driver") {
      await evaluationPassenger(idRated, stars);
    }

    return reply.send(evaluation);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Mobility/evaluation/CreateController.js',
      error: err?.message,
      method: 'createEvaluationController',
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

const getRattings = () => {
  return {
    stars: 0,
    totalRating: 0,
    totalStars: 0,
  };
};

const rattingNext = (data, rating, star) => {
  if (data.stars) {
    rating.stars = Number(data.stars);
  }

  if (data.rating && data.rating.totalRating && data.rating.totalStars) {
    rating.totalRating = Number(data.rating.totalRating);
    rating.totalStars = Number(data.rating.totalStars);
  }

  return {
    stars: (rating.totalStars + Number(star)) / (rating.totalRating + 1),
    totalRating: rating.totalRating + 1,
    totalStars: rating.totalStars + Number(star),
  };
};

const evaluationDriver = async (idDriver, star) => {
  const rating = getRattings();
  const driver = await DriverModel.findById(idDriver)
    .select({
      stars: 1,
      rating: 1,
    })
    .lean();

  if (!driver) {
    return false;
  }

  const next = rattingNext(driver, rating, star);
  await DriverModel.updateOne(
    { _id: idDriver },
    {
      stars: next.stars,
      rating: {
        totalRating: next.totalRating,
        totalStars: next.totalStars,
      },
    },
  );

  return {
    rating,
    next,
  };
};

const evaluationPassenger = async (idPassenger, star) => {
  const rating = getRattings();
  const passenger = await PassengerModel.findById(idPassenger)
    .select({
      stars: 1,
      rating: 1,
    })
    .lean();

  if (!passenger) {
    return false;
  }

  const next = rattingNext(passenger, rating, star);
  await PassengerModel.updateOne(
    { _id: idPassenger },
    {
      stars: next.stars,
      rating: {
        totalRating: next.totalRating,
        totalStars: next.totalStars,
      },
    },
  );

  return {
    rating,
    next,
  };
};

module.exports = createEvaluationController;
