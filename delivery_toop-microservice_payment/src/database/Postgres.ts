import {Sequelize} from 'sequelize';

const getSequelize = (): Sequelize => {
  const {PG_USER, PG_PASSWORD, PG_HOST, PG_PORT, PG_DATABASE} = process.env;
  const sequelize = new Sequelize(
    `postgres://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DATABASE}`,
    {
      logging: false,
      define: {
        timestamps: true,
      },
    },
  );

  return sequelize;
};

const connectPostgres = async (): Promise<void> => {
  try {
    const sequelize = getSequelize();
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    return;
  } catch (err) {
    console.log(err);
    return;
  }
};

export {connectPostgres, getSequelize};
