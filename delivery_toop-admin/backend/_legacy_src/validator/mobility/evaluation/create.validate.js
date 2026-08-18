const Joi = require("joi");
const mongoose = require("mongoose");

const validate = (req, res, next) => {
  try {
    const createValidate = Joi.object({
      typeEvaluator: Joi.string().valid("passenger", "driver").required().messages({
        "any.required": "Informe o tipo avaliador",
        "string.valid": "Informe o tipo avaliador corretamente",
      }),
      typeRated: Joi.string().valid("passenger", "driver").required().messages({
        "any.required": "Informe o tipo avaliado",
        "string.valid": "Informe o tipo avaliado corretamente",
      }),
      idEvaluator: Joi.string()
        .required()
        .custom((value, helper) => {
          if (!mongoose.isValidObjectId(value)) {
            return helper.message("Informe o avaliador");
          }

          return new mongoose.Types.ObjectId(value);
        }),
      idRated: Joi.string()
        .required()
        .custom((value, helper) => {
          if (!mongoose.isValidObjectId(value)) {
            return helper.message("Informe o avaliado");
          }

          return new mongoose.Types.ObjectId(value);
        }),
      paymentDriver: Joi.string()
        .required()
        .custom((value, helper) => {
          if (!mongoose.isValidObjectId(value)) {
            return helper.message("Informe um pagamento válido");
          }

          return new mongoose.Types.ObjectId(value);
        }),
      stars: Joi.number().precision(2).min(1).max(5).required().messages({
        "any.required": "Informe a nota da avaliação",
        "number.min": "a nota deve ser maior ou igaul a 1",
        "number.max": "a nota deve ser menor ou igaul a 5",
      }),
      description: Joi.string().optional().allow(""),
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
