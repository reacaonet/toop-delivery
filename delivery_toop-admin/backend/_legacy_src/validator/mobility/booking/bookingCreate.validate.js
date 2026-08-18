const Joi = require("joi");
const mongoose = require("mongoose");

const validate = (req, res, next) => {
  try {
    const createBookingValidate = Joi.object({
      passenger: Joi.string()
        .required()
        .custom((value, helper) => {
          if (!mongoose.isValidObjectId(value)) {
            return helper.message("Informe um passageiro válido");
          }
          return new mongoose.Types.ObjectId(value);
        })
        .messages({
          "any.required": "Informe o passageiro",
        }),
      customer: Joi.string()
        .required()
        .custom((value, helper) => {
          if (!mongoose.isValidObjectId(value)) {
            return helper.message("Informe um cliente válido");
          }
          return new mongoose.Types.ObjectId(value);
        })
        .messages({
          "any.required": "Informe o cliente",
        }),
      price: Joi.number().required().min(0.1).messages({
        "any.required": "preço da corrida não encontrado",
        "number.min": "preço da corrida não permitido",
      }),
      origin: Joi.object({
        address: Joi.string(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
      })
        .required()
        .messages({
          "any.required": "Informe o local de origem",
        }),
      destiny: Joi.array()
        .items(
          Joi.object().keys({
            address: Joi.string(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
          }),
        )
        .required()
        .min(1)
        .messages({
          "any.required": "Informe o local de destino",
          "array.min": "Informe o local de destino",
        }),
      additionalStops: Joi.any().optional().allow("", null),
      service: Joi.string()
        .required()
        .messages({
          "any.required": "Informe um serviço",
        })
        .custom((value, helper) => {
          if (!mongoose.isValidObjectId(value)) {
            return helper.message("Informe um serviço válido");
          }

          return new mongoose.Types.ObjectId(value);
        }),
      paymentMethod: Joi.string().valid("money", "credicard", "pix").required().messages({
        "any.required": "Informe um método de pagamento",
      }),
      qrCode: Joi.string().optional().allow(""),
      distance: Joi.string().optional().allow(""),
      routeTime: Joi.string().optional().allow(""),
      driver: Joi.string().optional().allow("", null),
      tagCost: Joi.any().optional().allow("", null),
      useWalletBalance: Joi.boolean().optional(),
      voucher: Joi.string().optional().allow("", null),
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
