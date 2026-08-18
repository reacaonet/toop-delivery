const create = require("./CreateController");
const link = require("./LinkController");
const send = require("./SendController");

module.exports = {
  method: {
    link,
    create,
    send,
  }
};
