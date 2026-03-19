const { BigQuery } = require('@google-cloud/bigquery');

const LogModel = require("../../../../models/LogModel");

const list = async (req, res) => {
  try {
    const projectId = 'economize-br-app';
    const keyFilename = './src/config/googlecloud.json';
    const LogModel = require("../../../../models/LogModel");

    const bigquery = new BigQuery({ projectId, keyFilename });

    const query = `SELECT
      name, gender,
      SUM(number) AS total
      FROM
        \`bigquery-public-data.usa_names.usa_1910_2013\`
      GROUP BY
        name, gender
      ORDER BY
        total DESC
      LIMIT 10
    `;

    const options = {
      query: query,
      // Location must match that of the dataset(s) referenced in the query.
      location: 'US',
    };

    const [job] = await bigquery.createQueryJob(options);
    console.log(`Job ${job.id} started.`);

    const [rows] = await job.getQueryResults();

    return res.status(200).send({
      message: 'dados retornados ?',
      rows,
    });

  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/v2/Report/App/ListController.js',
      error: err?.message,
      method: 'list',
      type: 'error',
      level: 0,
      origin: 'backend',
      request: {
        application: req?.application,
        franchise: req?.franchise,
        company: req?.company,
        params: req?.params,
        body: req?.body,
        query: req?.query,
        heders: req?.heders,
        method: req?.method,
        url: req?.url,
      },
    });

    console.log(`Log de erro criado com sucesso.`);

    return res.status(200).send({
      message: 'Não foi possível listar dados',
      err: err.message,
    });
  }
}

module.exports = list;
