const create = require('./CreateController');
const list = require('./ListController');
const paginator = require('./PaginatorController');
const update = require('./UpdateController');
const remove = require('./DeleteController');
const all = require('./AllController');
const cartUser = require('./CartuserCurrent');
const cartReorder = require('./CartReorder.js')

module.exports = {
  method: {
    create,
    list,
    paginator,
    update,
    remove,
    all,
    cartUser: cartUser.cartUserCurrent,
    cartReorder,
  }
}
