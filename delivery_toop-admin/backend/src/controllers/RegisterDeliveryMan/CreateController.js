const RegisterDeliveryMan = require("../../models/RegisterDeliveryManModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    console.log(req.body);
    const { name, location, cpf, celphone, email, city, city_id, state, state_id, imageSelfie, imagesCnh, imagesDocuments, vehicleType, status } = req.body;

    let coordinate = null;
    const register = await RegisterDeliveryMan.findOne({ cpf });

    let registerDeliveryMan;

    if (location && location.lat) {
      coordinate = {
        type: "Point",
        coordinates: [Number(location.lng), Number(location.lat)],
      };
    }

    if (register) {
      registerDeliveryMan = await RegisterDeliveryMan.findByIdAndUpdate(
        {
          _id: register._id,
        },
        {
          name,
          cpf,
          celphone,
          email,
          city,
          imageSelfie,
          imagesCnh,
          imagesDocuments,
          vehicleType,
          status,
          location: coordinate,
          city_id,
          state,
          state_id,
        },
      );
    } else {
      registerDeliveryMan = await RegisterDeliveryMan.create({
        name,
        cpf,
        celphone,
        email,
        city,
        imageSelfie,
        imagesCnh,
        imagesDocuments,
        vehicleType,
        status,
        location: coordinate,
        city_id,
        state,
        state_id,
      });
    }

    return res.send({
      status: 200,
      message: "Cadastro do Entregador criado com sucesso",
      data: registerDeliveryMan,
    });
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/RegisterDeliveryMan/CreateController.js',
      error: err?.message,
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
      message: "Falha ao criar Cadastro do entregador",
      Error: err.message,
    });
  }
};
