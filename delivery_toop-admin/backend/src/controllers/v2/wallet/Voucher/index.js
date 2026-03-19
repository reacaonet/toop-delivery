const validate = require('./ValidateController');
const create = require('./CreateController');
const update = require('./UpdateController');
const deleteController = require('./DeleteController');
const paginator = require('./PaginatorController');

module.exports = {
  method: {
    validate,
    create,
    update,
    detele: deleteController,
    paginator,
  },
};
