import {Sequelize} from 'sequelize';

let cachedSequelize: Sequelize | null = null;

const getSequelize = (): Sequelize => {
  if (cachedSequelize) return cachedSequelize;

  const PG_USER = process.env.POSTGRES_USER || process.env.PG_USER;
  const PG_PASSWORD = process.env.POSTGRES_PASSWORD || process.env.PG_PASSWORD;
  const PG_HOST = process.env.POSTGRES_HOST || process.env.PG_HOST;
  const PG_PORT = process.env.POSTGRES_PORT || process.env.PG_PORT;
  const PG_DATABASE = process.env.POSTGRES_DB || process.env.PG_DATABASE;
  cachedSequelize = new Sequelize(
    `postgres://${encodeURIComponent(PG_USER || '')}:${encodeURIComponent(PG_PASSWORD || '')}@${PG_HOST}:${PG_PORT}/${PG_DATABASE}`,
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
