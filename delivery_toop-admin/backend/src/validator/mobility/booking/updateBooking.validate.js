const Joi = require("joi");
const mongoose = require("mongoose");

const validate = (req, res, next) => {
  try {
    const createBookingValidate = Joi.object({
      id: Joi.string()
        .required()
        .custom((value, helper) => {
          if (!mongoose.isValidObjectId(value)) {
            return helper.message("Insira uma viagem válida");
          }

          return new mongoose.Types.ObjectId(value);
        }),
      driverId: Joi.string()
        .optional()
        .custom((value, helper) => {
          if (!mongoose.isValidObjectId(value)) {
            return helper.message("Insira um motorista válido");
          }

          return new mongoose.Types.ObjectId(value);
        }),
      // price: Joi.number().optional().min(0.1).messages({
      price: Joi.number().optional().min(0).messages({
        "any.required": "preço da viagem não encontrado",
        "number.min": "preço da viagem não permitido",
      }),
      origin: Joi.object({
        address: Joi.string(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
      })
        .optional()
        .messages({
          "any.required": "Insira o local de origem",
        }),
      destiny: Joi.array()
        .items(
          Joi.object().keys({
            address: Joi.string(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
          }),
        )
        .optional()
        .min(1)
        .messages({
          "any.required": "Insira o local de destino",
          "array.min": "Insira o local de destino",
        }),
      startRaceAt: Joi.date().iso().optional(),
      passenger: Joi.string().optional(),
      createPassenger: Joi.boolean().optional().allow(null, ""),
      additionalStops: Joi.any().optional().allow("", null),
      service: Joi.string()
        .optional()
        .messages({
          "any.required": "Insira um serviço",
        })
        .custom((value, helper) => {
          if (!mongoose.isValidObjectId(value)) {
            return helper.message("Insira um serviço válido");
          }

          return new mongoose.Types.ObjectId(value);
        }),
      distance: Joi.string().optional().allow(""),
      routeTime: Joi.string().optional().allow(""),
      company: Joi.string().optional().allow("", null),
      externalConsultant: Joi.string().optional().allow("", null),
      internalConsultant: Joi.string().optional().allow("", null),
      tag: Joi.string().optional().allow("", null),
      lng: Joi.string().optional().allow("", null),
      client: Joi.string()
        .optional()
        .custom((value, helper) => {
          if (value && !mongoose.isValidObjectId(value)) {
            return helper.message("Insira um cliente válido");
          } else if (!value) {
            return undefined;
          }

          return new mongoose.Types.ObjectId(value);
        })
        .allow(null, ""),
    });

    // schema options
    const options = {
      abortEarly: false, // include all errors
      allowUnknown: true, // ignore unknown props
      stripUnknown: true, // remove unknown props
    };

    const { error, value } = createBookingValidate.validate(req.body, options);

    if (error) {
      return res.status(400).send({
        message: getMessageErr(error),
        err: error.details.map(x => {
          return x.message;
        }),
      });
    } else {
      req.body = value;
      next();
    }
  } catch (err) {
    return res.status(400).send({
      message: "validação falhou",
      err: err.message,
    });
  }
};

const getMessageErr = error => {
  try {
    return error.details[0].message;
  } catch (err) {
    return "informe os campos corretamente";
  }
};

module.exports = validate;
