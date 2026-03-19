const Joi = require("joi");
const mongoose = require("mongoose");

const validate = (req, res, next) => {
  try {
    const changeRouteValidate = Joi.object({
      booking: Joi.string()
        .required()
        .custom((value, helper) => {
          if (!mongoose.isValidObjectId(value)) {
            return helper.message("Informe uma viagem válida");
          }

          return new mongoose.Types.ObjectId(value);
        })
        .messages({
          "any.required": "Informe uma viagem",
        }),
      origin: Joi.any().optional().allow("", null),
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
    });

    // schema options
    const options = {
      abortEarly: false, // include all errors
      allowUnknown: true, // ignore unknown props
      stripUnknown: true, // remove unknown props
    };

    const { error, value } = changeRouteValidate.validate(req.body, options);

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
