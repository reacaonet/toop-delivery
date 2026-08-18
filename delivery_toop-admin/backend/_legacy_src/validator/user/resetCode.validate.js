const Joi = require("joi");

const validate = (req, res, next) => {
  try {
    const resetCodeValidate = Joi.object({
      type: Joi.string().valid("driver", "user").required().messages({
        "any.required": "Informe um tipo",
        "string.valid": "Informe um tipo válido",
      }),
      email: Joi.string().email().required().messages({
        "any.required": "Informe um email",
        "string.email": "Informe um email válido",
      }),
      code: Joi.string().required().messages({
        "any.required": "Informe um código",
      }),
      password: Joi.string().required().messages({
        "any.required": "Informe a senha",
        "string.min": "senha deve ter pelo menos Min 4 caracteres",
        "string.max": "senha deve ter até Max 20 caracteres",
      }),
    });

    // schema options
    const options = {
      abortEarly: false, // include all errors
      allowUnknown: true, // ignore unknown props
      stripUnknown: true, // remove unknown props
    };

    const { error, value } = resetCodeValidate.validate(req.body, options);

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
