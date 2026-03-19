const all = require("./AllController");
const create = require("./CreateController");
const list = require("./ListController");
const update = require("./UpdateController");
const remove = require("./DeleteController");
const updateType = require("./UpdateTypeController");
const haveSchedule = require("./HaveSchedule");

module.exports = {
  method: {
    all,
    create,
    list,
    update,
    remove,
    updateType,
    haveSchedule,
  },
};
