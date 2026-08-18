const create = require("./CreateController");
const search = require("./SearchController");
const list = require("./ListAvaliationMediaController");

module.exports = {
  method: {
    create,
    search,
    list,
  },
};
