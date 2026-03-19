const mongoose = require("mongoose");

async function connectDb() {
  try {
    if (process.env.MONGO_ADMIN_USER && process.env.MONGO_ADMIN_PASSWORD) {
      mongoURI = `${process.env.MONGO_CONNECT_TYPE}://${process.env.MONGO_ADMIN_USER}:${process.env.MONGO_ADMIN_PASSWORD}@${process.env.URL_MONGO}?authSource=admin`;
    } else {
      mongoURI = `${process.env.MONGO_CONNECT_TYPE}://${process.env.URL_MONGO}`;
    }

    await mongoose.connect(mongoURI, {
      keepAlive: true,
      keepAliveInitialDelay: 300000,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    });

    return true;

  } catch (err) {
    console.log('Falha na conexão ...');
    return false;
  }
}

module.exports = connectDb;
