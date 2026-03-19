/** Libs */
require("dotenv").config({ path: "./src/config/.env" });
const mongoose = require("mongoose");

/** Conection */
const connectDb = require("./connectDB");

/* Model */
const EcbrDepartment = require("../../src/models/ProductDepartment/EcbrProductDepartment");
const Product = require("../../src/models/ProductModel");
const Department = require("../../src/models/Shopping/DepartmentModel");

/** Util */
const { getKeywords, getBarcode, getName } = require("./util");
const ProductModel = require("../../src/models/ProductModel");

const productMap = async () => {
  try {
    let isConnected = await connectDb();
    if (!isConnected) {
      // console.log('Script Finalizado ...');
      return process.exit();
    }

    let productWithDepartment = await Product.aggregate([
      {
        $match: {
          company: {
            $in: [
              mongoose.Types.ObjectId("5eb2a5ab3f3382ce0c5c223f"), // pratiko
              mongoose.Types.ObjectId("5ef0f078b7f4fa21e16ce3d6"), // pratiko
            ],
          },
          department: {
            $exists: true,
            $not: {
              $size: 0,
            },
          },
          existImageBank: {
            $ne: true,
          },
        },
      },
      {
        $group: {
          _id: { barcode: "$barcode" },
          name: { $last: "$name" },
          barcode: { $first: "$barcode" },
          images: { $first: "$images" },
          department: { $first: "$department" },
          description: { $first: "$description" },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 2000,
      },
    ]);

    let count = 0;

    for await (const item of productWithDepartment) {
      try {
        count++;
        if (count % 10 === 0) {
          // console.log('Processando lista', count);
        }

        let strBarcode = `${parseInt(`${item.barcode}`, 10)}`.length;

        if (strBarcode > 6) {
          let barcode = getBarcode(item.barcode);

          let ecbrProd = await EcbrDepartment.findOne({
            barcode,
          }).lean();

          if (!ecbrProd || !ecbrProd._id) {
            let copyright = false;

            if (item.copyright) {
              copyright = true;
            }

            let add = await EcbrDepartment.create({
              name: getName(item.name),
              barcode: barcode,
              keywords: getKeywords(item.name),
              images: item.images,
              departments: item.department,
              description: item.description,
              copyright: copyright,
            });

            // console.log('criando', add._id);
          } else if (ecbrProd && ecbrProd.images.length === 0 && item.images.length > 0) {
            // console.log('Atualizando', ecbrProd._id);
            let up = {
              images: item.images,
            };

            if (item.copyright) {
              up.copyright = true;
            }

            if (item.department && ecbrProd.departments && ecbrProd.departments.length == 0) {
              up.departments = item.department;
            }

            await EcbrDepartment.updateOne({ _id: ecbrProd._id }, up);
          }
        }
      } catch (err) {
        console.log("Fail item", item);
        console.log("Error Item", err);
      }
    }

    // console.log('Processamento finalizado ...');
    return process.exit();
  } catch (err) {
    console.log("Fail in", err);
    return process.exit();
  }
};

const checkProductDepartment = async () => {
  try {
    let isConnected = await connectDb();
    if (!isConnected) {
      // console.log('Script Finalizado ...');
      return process.exit();
    }

    let list = await Product.find({
      existImageBank: {
        $ne: true,
      },
    }).lean();

    let count = 0;
    let upCount = 0;

    for await (const item of list) {
      try {
        count++;
        if (count % 10 === 0) {
          // console.log('Processando lista', count);
        }

        let barcode = getBarcode(item.barcode);

        let ecbrProd = await EcbrDepartment.findOne({
          barcode,
        }).lean();

        if (ecbrProd && ecbrProd._id) {
          // atualizar
          await Product.updateOne(
            { _id: item._id },
            {
              existImageBank: true,
            },
          );
          upCount++;
        } else {
          await Product.updateOne(
            { _id: item._id },
            {
              existImageBank: false,
            },
          );
          upCount++;
        }
      } catch (err) {
        console.log("Error Item", err);
      }
    }

    console.log("Itens Processados ", count);
    console.log("Total Atualizado ", upCount);
  } catch (err) {
    console.log("Fail in", err);
    return process.exit();
  }
};

// productMap();
checkProductDepartment();
