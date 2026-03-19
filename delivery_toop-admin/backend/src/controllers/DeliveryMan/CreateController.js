const mongoose = require("mongoose");
const DeliveryMan = require("../../models/DeliveryMan/DeliveryManModel");

const DeliveryFreeModel = require("../../models/DeliveryMan/util/DeliveryFee");
const FranchiseModel = require("../../models/Franchise/FranchiseModel");

module.exports = async (req, res) => {
  try {
    const data = req.body;
    const { franchise, franchises } = req;

    data._id = new mongoose.Types.ObjectId().toHexString();
    let idFranchise = null;

    data.status = (typeof data.status === "string" && data.status === "") || data.status === null ? false : data.status;

    data.isOnline = (typeof data.isOnline === "string" && data.isOnline === "") || data.isOnline === null ? false : data.isOnline;

    data.showFreightValue =
      (typeof data.showFreightValue === "string" && data.showFreightValue === "") || data.showFreightValue === null ? false : data.showFreightValue;

    if (data.latitude && data.longitude) {
      data.location = {
        type: "Point",
        coordinates: [Number(data.longitude), Number(data.latitude)],
      };
    }

    if (franchise || franchises) {
      if (franchise) {
        idFranchise = franchise;
      } else if (franchises && Array.isArray(franchises) && franchises.length > 0) {
        idFranchise = franchises[0];
      }

      // console.log('Franquia Atual', idFranchise)

      if (idFranchise) {
        const respFranchise = await FranchiseModel.findById(idFranchise).lean();
        if (respFranchise && respFranchise.location) {
          delete respFranchise.location._id;
          data.location = respFranchise.location;
          data.franchise = respFranchise._id;
        }
      }
    }

    if (data.bankData) {
      if (!data.bankData.typeAccount) {
        delete data.bankData.typeAccount;
      }

      if (!data.bankData.pixKey) {
        delete data.bankData.pixKey;
      }

      if (!data.bankData.pixType) {
        delete data.bankData.pixType;
      }
    }

    if (data.companyService && Array.isArray(data.companyService) && data.companyService.length === 0) {
      delete data.companyService;
    }

    // console.log('Hey Entregador', data)
    let deliveryMan = await DeliveryMan.create(data);

    if (data.division && Array.isArray(data.division)) {
      const DeliveryFreeModel = {
        coupon: data._id,
        division: data.division,
      };

      await DeliveryMan.create(DeliveryFreeModel);
    }

    // deliveryMan = await deliveryMan.populate("person").populate("company").execPopulate();

    return res.send({
      status: 200,
      message: "Cadastro de Entregadores criada com sucesso",
      data: deliveryMan,
    });
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

    console.log("err", err);

    return res.status(400).send({
      message: "Falha ao criar Cadastro de Entregadores",
      error: err.message,
    });
  }
};
