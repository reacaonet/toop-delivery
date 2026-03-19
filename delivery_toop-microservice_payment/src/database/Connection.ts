import mongoose from 'mongoose';
let mongoURI = '';

const opcoes = {
  keepAlive: true,
  keepAliveInitialDelay: 300000,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
};

const connect = async (): Promise<void> => {
  if (process.env.MONGO_ADMIN_USER && process.env.MONGO_ADMIN_PASSWORD) {
    mongoURI = `${process.env.MONGO_CONNECT_TYPE}://${process.env.MONGO_ADMIN_USER}:${process.env.MONGO_ADMIN_PASSWORD}@${process.env.URL_MONGO}?authSource=admin`;
  } else {
    mongoURI = `${process.env.MONGO_CONNECT_TYPE}://${process.env.URL_MONGO}`;
  }

  mongoose
    .connect(mongoURI, opcoes)
    .then(async () => {
      console.log('Conexão estabelecida', process.env.URL_MONGO);
    })
    .catch((err) => {
      console.log('Conexão foi encerrada', err);
    });
};

export default connect;
