/** Libs */
require("dotenv").config({ path: "./src/config/.env" });
const axios = require("axios");

/** Service */
const readExcel = require("./readExcel");

/** Conection */
const connectDb = require("./connectDB");

/* Model */
const EcbrDepartment = require("../../src/models/ProductDepartment/EcbrProductDepartment");
const Product = require("../../src/models/ProductModel");
const imageBankOld = require("../../src/models/ImageBankModel");
const EcbrProductDepartment = require("../../src/models/ProductDepartment/EcbrProductDepartment");

/** Util */
const { getKeywords, getBarcode, getName } = require("./util");

const imageBankExcel = async () => {
  try {
    let isConnected = await connectDb();
    if (!isConnected) {
      console.log("Sem conexão com banco *_*");
      return process.exit();
    }

    let barcode = 0;
    let sheet = 0;
    let xlsFile = "scripts/syncDepartment/file/image_bank.xlsx"; // File

    let list = await readExcel().getExcel(barcode, sheet, xlsFile);
    await sendDB(list);

    console.log("Processo finalizado ...");
    // return process.exit();
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

    for await (const list of listSheet) {
      try {
        for await (const item of list) {
          let images = [];
          let barcode = getBarcode(item["barcode"]);
          let departments = [];
          let weight = "";
          let description = "";

          if (item["images.0"]) {
            let isImage = await testImage(item["images.0"]);
            if (isImage) {
              images.push(item["images.0"]);
            }
          }

          if (item["images.1"]) {
            let isImage = await testImage(item["images.1"]);
            if (isImage) {
              images.push(item["images.1"]);
            }
          }

          let ecbrDepart = await EcbrDepartment.findOne({
            barcode: barcode,
          }).lean();

          if (ecbrDepart && ecbrDepart.images.length <= 0 && images.length > 0) {
            console.log("Atualizando imagem", ecbrDepart._id, images);
            await EcbrDepartment.updateOne(
              {
                _id: ecbrDepart._id,
              },
              {
                images: images,
              },
            ); // atualizar imagens
          } else if (!ecbrDepart) {
            // Adicionar novo

            // Pesquisar para ver se já tem departamento
            let prod = await Product.findOne({
              barcode: barcode,
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
            })
              .select({ department: 1 })
              .lean();

            if (prod && prod._id) {
              departments = prod.department;
            }

            let create = await EcbrDepartment.create({
              name: getName(item["productName"]),
              barcode: barcode,
              keywords: getKeywords(item["productName"]),
              departments: departments,
              weight: weight,
              description: description,
              images: images,
            });

            console.log("Adicionado com sucesso", create._id);
          }
        }
      } catch (err) {
        console.log("Fail db", err.message);
        console.log("Item Current", item);
      }
    }
  } catch (err) {
    console.log("Fail db", err.message);
    console.log("Item Current", item);
  }
};

const syncDepartment = async () => {
  try {
    let isConnected = await connectDb();
    if (!isConnected) {
      console.log("Sem conexão com banco *_*");
      return process.exit();
    }

    let listEcbr = await EcbrDepartment.find({
      departments: {
        $exists: true,
        $size: 0,
      },
    }).lean();

    let count = 0;

    for await (const item of listEcbr) {
      count++;
      if (count % 10 === 0) {
        console.log("Processando lista", count);
      }

      let product = await Product.findOne({
        barcode: getBarcode(item.barcode),
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

      let up = {};

      if (product && product._id) {
        // atualizar departamento
        console.log("Ohh sincronizado departamento", item._id, product.department);
        up.departments = product.department;

        // if (product.images && product.images.length > 0 ) {
        //   up.images = product.images;
        // }

        await EcbrDepartment.updateOne({ _id: item._id }, up);
      }
    }

    console.log("Script finalizado ...");
    // return process.exit();
  } catch (err) {
    console.log("Fail in", err);
    return process.exit();
  }
};

// Sincronizar Imagens dos Produtos
const syncImagesToProduct = async () => {
  try {
    let isConnected = await connectDb();
    if (!isConnected) {
      console.log("Sem conexão com banco *_*");
      return process.exit();
    }

    const products = await Product.find({
      // company: {
      //   $in: [
      //     '5eb2bef93f338294035c24e6',
      //     '5eb2a5ab3f3382ce0c5c223f',
      //     '5ef0f078b7f4fa21e16ce3d6'
      //   ]
      // },
      images: {
        $exists: true,
        $size: 0,
      },
      // department: {
      //   $exists: true,
      //   $not: {
      //     $size: 0
      //   }
      // }
    })
      .sort({
        // updatePrice: -1
        updatedAt: -1,
      })
      .limit(2000)
      .lean();

    let count = 0;
    let upCount = 0;

    for await (const item of products) {
      count++;
      if (count % 10 === 0) {
        console.log("Processando lista", count);
      }

      let barcode = getBarcode(item.barcode);

      let ecbrDepartment = await EcbrDepartment.findOne({
        barcode: barcode,
      }).lean();

      let up = {};

      if (ecbrDepartment && item.barcode !== barcode) {
        up.barcode = barcode;
      }

      if (ecbrDepartment && ecbrDepartment.images && ecbrDepartment.images.length > 0) {
        up.images = ecbrDepartment.images;
        if (ecbrDepartment.copyright) {
          up.copyright = true;
        }
      }

      if ((!item.keywords || item.keywords.length <= 0) && ecbrDepartment && ecbrDepartment.keywords && ecbrDepartment.keywords > 0) {
        up.keywords = ecbrDepartment.keywords;
      }

      if (Object.keys(up).length > 0) {
        console.log("Ohh atualizado", item._id, "ecbr_id", ecbrDepartment._id);
        await Product.updateOne({ _id: item._id }, up);
        upCount++;
      }
    }

    console.log("Atualizado ", upCount);
    console.log("Script finalizado ...");
    // return process.exit();
  } catch (err) {
    console.log("Fail in", err);
    return process.exit();
  }
};

// procura produtos com departamentos e sem imagem na Digital Ocean
const syncImageInEcbr = async () => {
  try {
    let isConnected = await connectDb();
    if (!isConnected) {
      console.log("Sem conexão com banco *_*");
      return process.exit();
    }

    const list = await EcbrProductDepartment.find({
      // departments: {
      //   $exists: true,
      //   $not:{$size: 0}
      // },
      // departments: {
      //   $exists: true,
      //   $size: 0
      // },
      images: {
        $exists: true,
        $size: 0,
      },
      //copyright: false,
    })
      .sort({
        updatedAt: -1,
      })
      .limit(1000)
      .lean();

    let count = 0;

    for await (const item of list) {
      count++;
      if (count % 10 === 0) {
        console.log("Processando lista", count);
      }

      let barcode = getBarcode(item.barcode);
      let images = [];

      if (item.images && (item.images.length === 0 || item.copyright === false)) {
        let url1 = `https://economizebr.sfo2.cdn.digitaloceanspaces.com/productBarcode/ecbr/${barcode}/x1/01.jpg`;
        let isImage1 = await testImage(`${url1}`.replace("cdn.", "").trim());

        if (isImage1) {
          images.push(url1);
        }

        if (images.length > 0) {
          await EcbrProductDepartment.updateOne(
            { _id: item._id },
            {
              images,
              copyright: true,
            },
          );

          console.log("Atualizar imagem copyright", item._id);
        } else if (item.images && item.images.length === 0) {
          let isImage = await imageBankOld.findOne({ barcode: barcode }).lean();
          if (isImage && isImage.images && isImage.images.length > 0) {
            let images = [];
            let size = isImage.images.length;
            if (size == 2) {
              images.push(isImage.images[1]);
            } else {
              images.push(isImage.images[0]);
            }

            await EcbrProductDepartment.updateOne(
              { _id: item._id },
              {
                images,
                copyright: false,
              },
            );

            console.log("Atualizar imagem ImageBank", item._id, images);
          }
        }
      }
    }

    console.log("Script finalizado ...");
    // return process.exit();
  } catch (err) {
    console.log("Fail in", err);
    return process.exit();
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

// const lastScript = async () => {
//   try {
//     let isConnected = await connectDb();
//     if (!isConnected) {
//       console.log('Sem conexão com banco *_*');
//       return process.exit();
//     }

//     let list = await EcbrProductDepartment.find({
//       barcode: / $/
//     });

//     for await (const item of list) {
//       let trimBarcode = getBarcode(item.barcode);

//       let isItem = await EcbrProductDepartment.findOne({
//         barcode: trimBarcode
//       }).lean();

//       if (!isItem) {
//         await EcbrProductDepartment.updateOne({_id: item._id}, { barcode: trimBarcode });
//         console.log('atualizado item', item._id);
//       }

//       // if (isItem && isItem._id && item._id !== isItem._id ) {
//       //   console.log('removendo item', item._id);
//       //   await EcbrProductDepartment.deleteOne({ _id: item._id });
//       // }
//     }

//     console.log('Script finalizado ...');
//     return process.exit();
//   } catch (err) {
//     console.log('Fail in', err);
//     return process.exit();
//   }
// }

// imageBankExcel();
// syncDepartment();
// syncImagesToProduct();
// syncImageInEcbr();

(async function () {
  // console.log('Processando syncImageInEcbr');
  await syncImageInEcbr();

  console.log("Processando syncImagesToProduct");
  await syncImagesToProduct();

  console.log("Tudo Finalizado ....");
})();
