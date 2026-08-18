const create = require('./CreateController');
const list = require('./ListController');
const update = require('./UpdateController');
const remove = require('./DeleteController');
const cartItemComplement = require('./cartItemComplement');

module.exports = {
  method: {
    create,
    list,
    update,
    remove,
    cartItemComplement
  }
}
