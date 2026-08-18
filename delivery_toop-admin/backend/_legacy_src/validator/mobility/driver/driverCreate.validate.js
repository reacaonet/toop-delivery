const Joi = require("joi");
const mongoose = require("mongoose");

const validate = (req, res, next) => {
  try {
    const createDriverValidate = Joi.object({
      franchise: Joi.string()
        .required()
        .custom((value, helper) => {
          if (!mongoose.isValidObjectId(value)) {
            return helper.message("Informe uma franquia válida");
          }

          return new mongoose.Types.ObjectId(value);
        }),
      address: Joi.string().optional().allow("", null),
      files: Joi.any(),
      online: Joi.any(),
      confirmPassword: Joi.any(),
      name: Joi.string().min(5).max(255).required().messages({
        "string.min": "nome deve ter pelo menos Min 6 caracteres",
        "any.required": "Informe um nome",
      }),
      phone: Joi.string().min(9).max(15).required().messages({
        "string.min": "informe um telefone válido",
        "any.required": "Informe um telefone",
      }),
      email: Joi.string().email().required().messages({
        "any.required": "Informe um email",
        "string.email": "Informe um email válido",
      }),
      password: Joi.string().required(),
      birthDate: Joi.string(),
      cpf: Joi.string(),
      rg: Joi.string(),
      user: Joi.string(),
      status: Joi.boolean(),
      approved: Joi.boolean(),
      selfiePhoto: Joi.array().items(),
      carsDocument: Joi.array().items(),
      cnhDocuments: Joi.array().items(),
      identityDocuments: Joi.array().items(),
      services: Joi.array().items().messages({
        "any.required": "Informe os serviços que o motorista irá atuar",
      }),
      service: Joi.any(),
      activeRunStatus: Joi.any(),
      vehicleManufacturer: Joi.string(),
      vehicleModel: Joi.string(),
      vehicleNameplate: Joi.string(),
      vehicleColor: Joi.string(),
      vehicleYear: Joi.number(),
      terms: Joi.boolean().optional().allow("", null),
      genre: Joi.any().optional().allow("", null),
      bankData: Joi.any().optional().allow("", null),
      addNewCredit: Joi.any().optional().allow("", null),
      creditBalance: Joi.any().optional().allow("", null),
      block: Joi.any().optional().allow("", null),
    });

    // schema options
    const options = {
      abortEarly: false, // include all errors
      allowUnknown: true, // ignore unknown props
      stripUnknown: true, // remove unknown props
    };

    const { error, value } = createDriverValidate.validate(req.body, options);

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
