const list = require('./ListController');
const create = require('./CreateController');

module.exports = {
  method: {
    create,
    list,
  }
}
