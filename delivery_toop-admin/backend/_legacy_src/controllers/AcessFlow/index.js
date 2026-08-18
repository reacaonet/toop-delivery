const create = require("./CreateController");
const list = require("./ListController");
const statistic = require("./statisticController");

module.exports = {
  method: {
    create,
    list,
    statistic,
  },
};
