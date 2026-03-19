/** Libs */
require("dotenv").config({ path: "./src/config/.env" });
const prompts = require("prompts");
const readExcel = require("./readExcel");
const axios = require("axios");
const mongoose = require("mongoose");

/** Conection */
const connectDb = require("./connectDB");

/* Model */
const EcbrDepartment = require("../../src/models/ProductDepartment/EcbrProductDepartment");
const Product = require("../../src/models/ProductModel");
const imageBankOld = require("../../src/models/ImageBankModel");

/** Util */
const { getKeywords, getBarcode, getName } = require("./util");
const { Mongoose } = require("mongoose");

let execute = false;
let barcode = 0;
let sheet = null;
// let url = null;

const SyncDepartment = async () => {
  try {
    let isConnected = await connectDb();
    if (!isConnected) {
      console.log("Script Finalizado ...");
      return;
    }

    await questions();

    if (execute == false) {
      console.log("Até a próxima velhinho :)");
      return process.exit();
    }

    let xlsFile = "scripts/syncDepartment/file/LISTA DE PRODUTOS.xlsx"; // File
    let list = await readExcel().getExcel(barcode, sheet, xlsFile);
    await sendDB(list);

    console.log("Script Finalizado ...");
    return process.exit();
  } catch (err) {
    console.log("Falha ao listar dados");
    return false;
  }
};

const questions = async () => {
  try {
    const execQuestion = await prompts({
      type: "select",
      name: "isExecute",
      message: "Deseja executar o Script ?",
      choices: [
        { title: "Sim", value: true },
        { title: "Não", value: false },
      ],
    });

    execute = execQuestion.isExecute;
    if (execute === false) {
      return;
    }

    const response = await prompts([
      {
        type: "number",
        name: "startingPoint",
        message: "Deseja iniciar por um código de barra ?",
        initial: 0,
        style: "default",
      },
      {
        type: "text",
        name: "sheet",
        message: "Informe o nome da planilha caso queira carregar apeans ela",
        initial: null,
        // style: 'default',
      },
      // {
      //   type: 'text',
      //   name: 'urlOrFile',
      //   message: 'Informar uma url ou caminho que encontra-se o arquivo',
      //   initial: 'https://docs.google.com/spreadsheets/d/12yZE_BTT_2WbTRkClpzNhE2yjsCFJDZSyy03wD95TDw/edit#gid=1381413300',
      //   style: 'default',
      // }
    ]);

    barcode = response.startingPoint;
    sheet = response.sheet;
    url = response.urlOrFile;
  } catch (err) {
    return;
  }
};

const sendDB = async listSheet => {
  try {
    if (!listSheet || typeof listSheet !== "object" || listSheet.length <= 0) {
      console.log("Hey Sem dados para processar ...");
      return;
    }

    let count = 0;

    for await (const list of listSheet) {
      try {
        for await (const item of list) {
          count++;
          if (count % 10 === 0) {
            console.log("Processando lista", count);
          }

          let barcode = getBarcode(item["Cód Barras"]);
          let response = await EcbrDepartment.findOne({ barcode }).lean();

          if (!response || !response._id) {
            // pesquisar departamento
            let departments = [];
            let images = [];
            let description = "";
            let weight = "";
            let keywords = [];
            let copyright = false;

            if (barcode && `${barcode}`.length > 6) {
              let product = await Product.findOne({
                barcode,
                company: {
                  $in: [
                    "5eb2a5ab3f3382ce0c5c223f", // pratiko
                    "5ef0f078b7f4fa21e16ce3d6", // pratiko
                  ],
                },
                department: {
                  $exists: true,
                  $not: { $size: 0 },
                },
              }).lean();

              if (product) {
                departments = product.department;
              }

              let url1 = `https://economizebr.sfo2.digitaloceanspaces.com/productBarcode/ecbr/${barcode}/x1/01.jpg`;
              let isImage1 = await testImage(url1);

              if (isImage1) {
                copyright = true;
                images = [url1];
              } else if (!isImage1) {
                let isImage = await imageBankOld.findOne({ barcode: barcode }).lean();
                if (isImage && isImage.images && isImage.images.length > 0) {
                  let size = isImage.images.length;
                  if (size == 2) {
                    images.push(isImage.images[1]);
                  } else {
                    images.push(isImage.images[0]);
                  }
                }
              }

              if (item["Descrição"]) {
                description = getName(item["Descrição"]);
              }

              if (item["PESO/GRAMATURA"]) {
                weight = item["PESO/GRAMATURA"];
              }

              keywords = getKeywords(item["Descrição"]);

              let payload = {
                name: getName(item["Descrição"]),
                images: images,
                barcode: barcode,
                keywords: keywords,
                departments: departments,
                weight: weight,
                description: description,
                copyright,
              };

              // console.log('adicionado ...');
              await EcbrDepartment.create(payload);
            }
          }
        }
      } catch (err) {
        console.log("Fail db", err.message);
        console.log("Item Current", item);
      }
    }
  } catch (err) {
    console.log("Fail to sendDB", err);
  }
};

const testImage = async url => {
  try {
    const resImage = await axios.get(url);
    let contentType = resImage.headers["content-type"];

    if (resImage.status === 200 && contentType.search("image") > -1) {
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
};

// const convertStrToObject = async () => {
//   try {
//     let isConnected = await connectDb();
//     if (!isConnected) {
//       console.log('Script Finalizado ...');
//       return;
//     }

//     const list = await EcbrDepartment.find({
//       departments: {
//         $exists: true,
//         $not: {$size: 0}
//       },
//     }).lean();

//     let count = 0;

//     for await (const item of list) {
//       count++;
//       if (count % 10 === 0) {
//         console.log('Processando lista', count);
//       }

//       if (item.departments && item.departments.length > 0) {
//         let departments = item.departments.map(el => (
//           mongoose.Types.ObjectId(el)
//         ));

//         await EcbrDepartment.updateOne({_id: item._id}, {
//           departments
//         });
//       }
//     }

//     console.log('Script Finalizado ...');
//     return process.exit();
//   } catch (err) {
//     console.log('Falha ao listar dados');
//     return false;
//   }
// };

SyncDepartment();
// convertStrToObject();
