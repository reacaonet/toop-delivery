/** Libs */
require("dotenv").config({ path: "./src/config/.env" });
const axios = require("axios");

/** Service */
const readExcel = require("./readExcel");

/* Model */
const EcbrDepartment = require("../../src/models/ProductDepartment/EcbrProductDepartment");

/** Conection */
const connectDb = require("./connectDB");

/** Util */
const { getBarcode } = require("./util");

const excelImageInDepartment = async () => {
  try {
    let isConnected = await connectDb();
    if (!isConnected) {
      console.log("Sem conexão com banco *_*");
      return process.exit();
    }

    let barcode = 0;
    let sheet = 0;
    let xlsFile = "scripts/syncDepartment/file/produtos-sem-imagens.xlsx"; // File

    let list = await readExcel().getExcel(barcode, sheet, xlsFile);
    await sendDB(list);

    console.log("Processo finalizado ...");
    return process.exit();
  } catch (err) {
    console.log("Fail in", err);
    return process.exit();
  }
};

const sendDB = async listSheet => {
  try {
    if (!listSheet || typeof listSheet !== "object" || listSheet.length <= 0) {
      console.log("Hey Sem dados para processar ...");
      return;
    }

    let count = 0;
    let upCount = 0;

    for await (const list of listSheet) {
      try {
        for await (const item of list) {
          count++;
          if (count % 10 === 0) {
            console.log("Processando lista", count);
          }

          let images = [];
          let barcode = getBarcode(item["barcode"]);

          if (barcode && `${barcode}`.length > 6) {
            let xlsImage = item["images"];
            // console.log('xlsImage', xlsImage);

            if (xlsImage && `${xlsImage}`.length > 10) {
              let isImage = await testImage(`${xlsImage}`.replace("cdn.", "").trim());
              if (isImage) {
                images = [`${xlsImage}`.trim()];

                let current = await EcbrDepartment.findOne({
                  barcode,
                  images: {
                    $exists: true,
                    $size: 0,
                  },
                })
                  .select({
                    _id: 1,
                    copyright: 1,
                  })
                  .lean();

                if (current && current.copyright === false) {
                  await EcbrDepartment.updateOne(
                    { barcode },
                    {
                      images,
                    },
                  );

                  upCount++;
                  console.log("Atualizado", upCount, current._id);
                }
              }
            }
          }
        }
      } catch (err) {
        console.log("Fail db", err.message);
      }
    }

    return true;
  } catch (err) {
    console.log("Fail db", err.message);
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

excelImageInDepartment();
