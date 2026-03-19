/** Lib */
require('dotenv').config({ path: './src/config/.env' });
const moment = require('moment');
const integrationApi = require('../../src/services/integrationApi');

/** Conection */
const connectDb = require('./connectDB');

/** Model */
const Company = require('../../src/models/Company/CompanyModel');
const Product = require('../../src/models/ProductModel');

const SyncPratiko = async () => {
  try {
    let isConnected = await connectDb();
    if (!isConnected) {
      console.log('Script Finalizado ...');
      return process.exit();
    }

    let idsPratiko = [
      '5eb2a5ab3f3382ce0c5c223f',
      '5ef0f078b7f4fa21e16ce3d6'
    ];

    let listProducts = await Product.find({
      company: {
        $in: idsPratiko
      },
      barcode: {
        $exists: true
      },
      updatedAt: {
        $lte: moment().subtract('1', 'days').toDate(),
      },
    })
    .populate('company', {
      _id: 1,
      cnpj: 1
    })
    .sort({
      updatedAt: 1,
    })
    .lean();

    console.log('Processando lista ....');
    let count = 0;

    for await (const item of listProducts) {
      count++;
      if (count % 10 === 0) {
        console.log('Processando lista', count);
      }

      if (item.company && item.company.cnpj) {
        let cnpj = item.company.cnpj;
        let company = item.company._id;
        let barcode = item.barcode;

        let url = `/rpinfo/products/barcode/${barcode}/cnpj/${cnpj}?company=${company}&synchronize=true`;
        const {data: response} = await integrationApi.get(url);

        if (!response || !response.syncPayload) {
          console.log('Falhou ao sincronizar código de barra', barcode, company);
        }
      } else {
        console.log('cnpj não existe ...');
      }
    }

    console.log('Script Finalizado ....');
  } catch (err) {
    console.log('Falhou', err);
  }
};

SyncPratiko();

