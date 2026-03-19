const create = require('./CreateController');
const tree = require('./TreeController');
const update = require('./UpdateController');
const remove = require('./DeleteController');

module.exports = {
  method: {
    create,
    tree,
    update,
    remove
  }
}
