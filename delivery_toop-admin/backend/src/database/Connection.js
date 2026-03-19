const conection = require("mongoose");
const seed = require("./seed");
let mongoURI = "";

const CashBackCron = require("../cron/cashback");
const AccountBalanceCron = require("../cron/accountBalance");
const PixCron = require("../cron/pixPay");
const StartScheduledRaces = require("../cron/StartScheduledRaces");

if (process.env.MONGO_ADMIN_USER && process.env.MONGO_ADMIN_PASSWORD) {
  mongoURI = `${process.env.MONGO_CONNECT_TYPE}://${process.env.MONGO_ADMIN_USER}:${process.env.MONGO_ADMIN_PASSWORD}@${process.env.URL_MONGO}?authSource=admin`;
} else {
  mongoURI = `${process.env.MONGO_CONNECT_TYPE}://${process.env.URL_MONGO}`;
}

const opcoes = {
  keepAlive: true,
  keepAliveInitialDelay: 300000,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
};

conection
  .connect(mongoURI, opcoes)
  .then(async () => {
    console.log("Conexão estabelecida", process.env.URL_MONGO);

    // CashBackCron.CashBackCron();
    // CashBackCron.CashBackBalanceCron();
    // AccountBalanceCron.AccountBalance();

    if (process.env.production === "true") {
      PixCron();
    }

    StartScheduledRaces();
    // await seed.populate();
  })
  .catch(err => {
    console.log("Conexão foi encerrada", err);
  });

module.exports = conection;
