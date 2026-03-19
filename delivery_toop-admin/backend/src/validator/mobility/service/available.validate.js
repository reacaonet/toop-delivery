const Joi = require("joi");

const validate = (req, res, next) => {
  try {
    const availableValidate = Joi.object({
      origenLatitude: Joi.number().required().messages({
        "any.required": "Informe um a latitude de origem",
      }),
      origenLongitude: Joi.number().required().messages({
        "any.required": "Informe um a longitude de origem",
      }),
      destinyLatitude: Joi.number().required().messages({
        "any.required": "Informe um a latitude de destino",
      }),
      destinyLongitude: Joi.number().required().messages({
        "any.required": "Informe um a longitude de destino",
      }),
      franchise: Joi.string().optional().allow("", null),
      person: Joi.string().optional().allow("", null),
      additionalStops: Joi.string().optional().allow(""),
      passenger: Joi.string().optional().allow("", null),
      additionalStops: Joi.string().optional().allow(""),
      driver: Joi.string().optional().allow("", null),
      serviceType: Joi.string().optional().allow("", null),
    });

    // schema options
    const options = {
      abortEarly: false, // include all errors
      allowUnknown: true, // ignore unknown props
      stripUnknown: true, // remove unknown props
    };

    const { error, value } = availableValidate.validate(req.query, options);

    if (error) {
      return res.status(400).send({
        message: "informe os campos corretamente",
        err: error.details.map(x => {
          return x.message;
        }),
      });
    } else {
      req.query = value;
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
