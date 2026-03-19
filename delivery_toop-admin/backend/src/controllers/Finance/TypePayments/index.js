const create = require('./CreateController');
const list = require('./ListController');
const paginator = require('./PaginatorController');
const listForCompanyDeliveryController = require('./ListForCompanyDeliveryController');
const update = require('./UpdateController');
const remove = require('./DeleteController');

module.exports = {
  method: {
    list,
    paginator,
    listForCompanyDeliveryController,
    create,
    update,
    remove
  }
}
