import {Sequelize} from 'sequelize';

let cachedSequelize: Sequelize | null = null;

const getSequelize = (): Sequelize => {
  if (cachedSequelize) return cachedSequelize;

  const {PG_USER, PG_PASSWORD, PG_HOST, PG_PORT, PG_DATABASE} = process.env;
  cachedSequelize = new Sequelize(
    `postgres://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DATABASE}`,
    {
      logging: false,
      define: {
        timestamps: true,
      },
    },
  );

  return cachedSequelize;
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
