const create = require("./CreateController");
const list = require("./ListController");
const listOne = require('./ListOneController');
const paginator = require("./PaginatorController");
const update = require("./UpdateController");
const remove = require("./DeleteController");
const syncImage = require('./SyncImageController')

module.exports = {
  method: {
    list,
    listOne,
    create,
    paginator,
    update,
    remove,
    syncImage,
  },
};
