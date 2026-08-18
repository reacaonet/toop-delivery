const Joi = require("joi");
const mongoose = require("mongoose");

const validate = (req, res, next) => {
  try {
    const createValidate = Joi.object({
      message: Joi.string().min(3).required().messages({
        "any.required": "Informe uma mensagem",
        "string:min": "Informe uma mensagem de pelo menos 3 caracteres",
      }),
      type: Joi.string().required().valid("text").messages({
        "any.required": "Informe o tipo de mensagem",
      }),
      booking: Joi.string()
        .required()
        .custom((value, helper) => {
          if (!mongoose.isValidObjectId(value)) {
            return helper.message("Informe a reserva");
          }

          return new mongoose.Types.ObjectId(value);
        }),
      sent: Joi.string().required().valid("driver", "passenger"),
      receive: Joi.string().required().valid("driver", "passenger"),
      passenger: Joi.string()
        .required()
        .custom((value, helper) => {
          if (!mongoose.isValidObjectId(value)) {
            return helper.message("Informe um passageiro válido");
          }

          return new mongoose.Types.ObjectId(value);
        }),
      driver: Joi.string()
        .required()
        .custom((value, helper) => {
          if (!mongoose.isValidObjectId(value)) {
            return helper.message("Informe um motorista válido");
          }

          return new mongoose.Types.ObjectId(value);
        }),
    });

    // schema options
    const options = {
      abortEarly: false, // include all errors
      allowUnknown: true, // ignore unknown props
      stripUnknown: true, // remove unknown props
    };

    const { error, value } = createValidate.validate(req.body, options);

    if (error) {
      return res.status(400).send({
        message: "informe os campos corretamente",
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

module.exports = validate;
