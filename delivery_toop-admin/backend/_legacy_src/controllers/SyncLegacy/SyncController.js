require("dotenv").config({
  path: "./src/config/.env"
});

const axios = require("axios");
const aws = require('aws-sdk');
const bcrypt = require("bcrypt");
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const sharp = require("sharp");
const {
  v4: uuidv4
} = require('uuid');

const CityModel = require('../../models/Setting/CityModel');
const CompanyModel = require('../../models/Company/CompanyModel');
const CompanyDeliveryModel = require('../../models/Company/CompanyDeliveryModel');
const DeliveryManModel = require('../../models/DeliveryMan/DeliveryManModel.js');
const FranchiseModel = require('../../models/Franchise/FranchiseModel');
const GroupModel = require('../../models/GroupModel');
const PersonModel = require('../../models/Person/PersonModel');
const SegmentModel = require('../../models/Company/SegmentModel');
const StateModel = require('../../models/Setting/StateModel');
const UserModel = require('../../models/UserModel');
// Food
const CategoryModel = require('../../models/Food/CategoryModel');
const ProductModel = require('../../models/Food/ProductModel');
const ProductComplementModel = require('../../models/Food/ProductComplementModel');
const ProductComplementItemModel = require('../../models/Food/ProductComplementItemModel');
// Product
const MarketDepartmentModel = require('../../models/Shopping/DepartmentModel.js');
const MarketProductModel = require('../../models/ProductModel.js');
const LogModel = require("../../models/LogModel");



const getUserByEmail = async (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await UserModel.findOne({
        email,
        deletedAt: {
          $exists: false,
        },
        franchises: {
          $exists: true,
        },
      }, {
        status: 1,
        name: 1,
        email: 1
      }).populate('franchises', {
        name: 1
      })

      resolve(user);
    } catch (error) {
      return reject(error);
    }
  });
}

const getFranchiseByEmail = async (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      const franchise = await FranchiseModel.findOne({
        email,
        deletedAt: {
          $exists: false,
        }
      })

      resolve(franchise);
    } catch (error) {
      return reject(error);
    }
  });
}

const syncDeliverymen = async (franchise, userCity, login) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Legacy Deliveryman
      const mtAdminDriver = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'json', 'mt_driver.json')));

      // Find Companies User
      let countRegister = 0;
      for await (const driver of mtAdminDriver) {
        if (String(driver.cidade).trim().toLowerCase() === userCity) {
          console.log(countRegister++, 'encontrou', driver.first_name, driver.last_name, login);

          let driverState = (typeof driver.estado === 'string' && String(driver.estado).trim().length > 0) ? String(driver.estado).trim().toUpperCase() : 'GO';
          const driverCity = (typeof driver.cidade === 'string' && String(driver.cidade).trim().length > 0) ? String(driver.cidade).trim().toUpperCase() : 'GOIANIA';

          switch (driverState) {
            case 'PARAÍBA':
              driverState = 'PB';
              break;
            case 'SANTA CATARINA':
              driverState = 'SC';
              break;
            case 'SÃO PAULO ..':
            case 'SÃO PAULO':
            case 'SAO PAULO':
              driverState = 'SP';
              break;
            default:
              break;
          }
          // Register State
          // const upsertState = await StateModel.findOneAndUpdate({
          //   // name: driverState,
          //   uf: driverState,
          // }, {
          //   $set: {
          //     name: driverState,
          //     uf: driverState,
          //   }
          // }, {
          //   upsert: false,
          //   new: true,
          // }).lean();

          console.log(1)
          const upsertState = await StateModel.findOne({
            uf: driverState,
          }).lean();

          console.log(2)
          if (!upsertState) {
            console.log('2.1', driverState, driver)
            return res.status(400).send({
              message: "NÃO EXISTE ESSE ESTADO",
              driverState,
              driver,
            });
          }


          console.log('2.2', {
            name: driverCity,
            state: upsertState._id,
            deletedAt: {
              $exists: false,
            },
          })
          // Register City
          const upsertCity = await CityModel.findOneAndUpdate({
            name: driverCity,
            state: upsertState._id,
            deletedAt: {
              $exists: false,
            },
          }, {
            $set: {
              name: driverCity,
              state: upsertState._id,
            }
          }, {
            upsert: true,
            new: true,
          })
            // .catch(error => console.log('errorrr citty', error))
            .lean();

          console.log(3)

          // Search Company
          const companyFranchise = await CompanyModel.findOne({
            franchise: franchise._id,
          }, {
            name: 1
          }).lean();

          if (!companyFranchise) {
            console.log('3.1', 'NÃO ENCONTROU COMPANY')
            return res.status(400).send({
              message: "NÃO EXISTE COMPANY",
              driverState,
              driver,
            });
          }



          // Create Person
          const payloadPerson = {
            franchise: franchise._id,
            company: companyFranchise._id,
            name: String(driver.first_name).trim() + ' ' + String(driver.last_name).trim(),
            email: String(driver.email).trim().toLowerCase(),
            cpf: String(driver.cpf).trim().replace(/[^0-9]/g, ''),
            city: upsertCity._id,
            phone: Number(String(driver.phone || '').trim().replace(/[^0-9]/g, '')),
            status: (driver.status === 'active') ? true : false,
            genre: 'H',
          };
          console.log(4, {
            franchise: franchise._id,
            company: companyFranchise._id,
            name: String(driver.first_name).trim() + ' ' + String(driver.last_name).trim(),
            email: String(driver.email).trim().toLowerCase(),
            cpf: String(driver.cpf).trim().replace(/[^0-9]/g, ''),
            city: upsertCity._id,
            phone: Number(String(driver.phone || '').trim().replace(/[^0-9]/g, '')),
            status: (driver.status === 'active') ? true : false,
            genre: 'H',
          })
          // Register Person
          const upsertPerson = await PersonModel.findOneAndUpdate({
            cpf: payloadPerson.cpf
          }, {
            $set: payloadPerson
          }, {
            upsert: true,
            new: true,
          }).lean();

          console.log('4.1')
          // Define Type Vehicle
          let typeOfVehicle = 'MOTO';
          switch (String(driver.transport_type_id || '').trim()) {
            case 'bike':
              typeOfVehicle = 'BICICLETA'
              break;
            case 'bicycle':
            case 'scooter':
              typeOfVehicle = 'MOTO'
              break;
            case 'car':
              typeOfVehicle = 'CARRO'
              break;
            default:
              typeOfVehicle = 'MOTO';
              break;
          }

          // Create Deliveryman
          const payloadDeliveryman = {
            franchise: franchise._id,
            person: upsertPerson._id,
            phone: String(driver.phone || '').trim().replace(/[^0-9]/g, ''),
            // company: '5ec593cb9c488f1ce8043892',
            company: companyFranchise._id,
            typeOfVehicle: typeOfVehicle,
            model: typeOfVehicle,
            board: String(driver.licence_plate || '').trim().toUpperCase(),
            color: String(driver.color || '').trim().toUpperCase(),
            showFreightValue: true,
          };
          console.log(5)
          // Register DeliveryMan
          const upsertDeliveryman = await DeliveryManModel.findOneAndUpdate({
            person: upsertPerson._id,
            deletedAt: {
              $exists: false,
            },
          }, {
            $set: payloadDeliveryman
          }, {
            upsert: true,
            new: true,
          }).lean();

          const newPasswod = await bcrypt.hash('mudar123', 11);

          // Register User
          const payloadUser = {
            franchise: franchise._id,
            company: companyFranchise._id,
            person: upsertPerson._id,
            name: String(driver.first_name).trim() + ' ' + String(driver.last_name).trim(),
            email: String(driver.email).trim(),
            password: newPasswod
          };
          console.log(6)
          // Register User
          // Register DeliveryMan
          const upsertUser = await UserModel.findOneAndUpdate({
            person: upsertPerson._id,
            deletedAt: {
              $exists: false,
            },
          }, {
            $set: payloadUser
          }, {
            upsert: true,
            new: true,
          }).lean();

          if (upsertUser.name) {
            console.log('Novo entregador', upsertUser.name)
          }

        }
      }


      return resolve(true);
    } catch (error) {
      return reject(error);
    }
  });
}

const syncCompanies = async (franchise, userCity) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Legacy Companies
      const mtMerchant = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'json', 'mt_merchant.json')));
      const listCompanies = [];

      console.log('buscando cidade', userCity)
      // Find Companies User
      for await (const comp of mtMerchant) {
        if (String(comp.city).trim().toLowerCase() === userCity) {
          console.log('CompanyName:', comp.merchant_id, comp.restaurant_name)

          // Create Group
          const payloadGroup = {
            images: ['https://toopdelivery.sfo3.digitaloceanspaces.com/producthomolog/2d6ce3eb-036d-490d-ad2d-26bafc9e068f.png'],
            status: (comp.status === 'active') ? true : false,
            franchise: franchise._id,
            name: String(comp.restaurant_name).trim(),
            description: String(comp.restaurant_slug).trim(),
          };

          const group = await GroupModel.findOneAndUpdate({
            name: String(comp.restaurant_name).trim(),
            franchise: franchise._id,
          }, {
            $set: payloadGroup,
          }, {
            upsert: true,
            new: true,
          }).lean();

          // Create Segment
          const segment = await SegmentModel.findOneAndUpdate({
            name: 'RESTAURANTES',
            franchise: franchise._id,
          }, {
            $set: {
              name: 'RESTAURANTES',
              franchise: franchise._id,
              status: true,
              images: ['https://toopdelivery.sfo3.digitaloceanspaces.com/producthomolog/2d6ce3eb-036d-490d-ad2d-26bafc9e068f.png'],
            }
          }, {
            upsert: true,
            new: true,
          }).lean();

          // Create Company
          const payloadCompany = {
            franchise: franchise._id,
            name: String(comp.restaurant_name).trim(),
            description: String(comp.restaurant_slug).trim(),
            status: (comp.status === 'active') ? true : false,
            address: String(comp.street).trim(),
            shoppingFlow: 'MENU',
            type: 'restaurant',
            phone: String(comp.restaurant_phone || comp.contact_phone).trim().replace(/[^0-9]/g, ''),
            groups: group._id,
            segment: segment._id,
            images: ['https://toopdelivery.sfo3.digitaloceanspaces.com/producthomolog/2d6ce3eb-036d-490d-ad2d-26bafc9e068f.png'],
            location: {
              coordinates: [Number(comp.lontitude), Number(comp.latitude)],
              type: "Point"
            },
          }

          const company = await CompanyModel.findOneAndUpdate({
            name: String(comp.restaurant_name).trim(),
            franchise: franchise._id,
          }, {
            $set: payloadCompany
          }, {
            upsert: true,
            new: true,
          }).lean();


          // Create Company Delivery
          const payloadCompanyDelivery = {
            isOpen: true,
            company: company._id,
            cieloMerchantId: '123456789',
            mdr: 0,
            fee: 15,
            fee_local: 0,
            max_distance: 10000,
            distance: [{
              min: 0,
              max: 1000,
              price: 0,
              delivery_time: 25
            }, {
              min: 701,
              max: 5000,
              price: 7.5,
              delivery_time: 30
            }, {
              min: 5001,
              max: 10000,
              price: 9.5,
              delivery_time: 40
            }, {
              min: 10001,
              max: 20000,
              price: 10.5,
              delivery_time: 45
            }],
            min_purchase: 20,
            max_amount_items: 20,
            time_to_call_delivery: 0,
          }

          const companyDelivery = await CompanyDeliveryModel.findOneAndUpdate({
            company: company._id,
          }, {
            $set: payloadCompanyDelivery
          }, {
            upsert: true,
            new: true,
          }).lean();

          listCompanies.push(company);
        }
      }

      console.log('Companies', listCompanies.length)

      resolve(listCompanies);
    } catch (error) {
      return reject(error);
    }
  });
}

const syncCheckDeliveryCompanies = async (franchise, userCity) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Legacy Companies
      const companiesWithOneDelivery = [];
      const companiesWithoutDelivery = [];
      const companiesWithManyDelivery = [];
      let countCompanies = 0;
      // ilves
      const franchiseId = '60f5f9f4706131003472103a';

      const company = await CompanyModel.find({
        franchise: franchiseId,
        deletedAt: {
          $exists: false,
        }
      }).lean();

      console.log('Total de companies', company.length)

      for await (const comp of company) {
        // Check if exists delivery
        console.log('Verificando company', countCompanies++ + '/' + company.length, comp.name)
        const companyDelivery = await CompanyDeliveryModel.find({
          company: comp._id,
        }).lean();

        if (companyDelivery.length === 0) {
          companiesWithoutDelivery.push({
            _id: comp._id,
            name: comp.name,
          })
        } else if (companyDelivery.length > 1) {
          companiesWithManyDelivery.push({
            _id: comp._id,
            name: comp.name,
          })
        } else {
          companiesWithOneDelivery.push({
            _id: comp._id,
            name: comp.name,
          })
        }

      }

      console.log('Without companies', companiesWithoutDelivery.length, companiesWithoutDelivery)
      console.log('Many companies', companiesWithManyDelivery.length, companiesWithManyDelivery)
      console.log('One company', companiesWithOneDelivery.length, companiesWithOneDelivery)

      resolve(companiesWithoutDelivery);
    } catch (error) {
      return reject(error);
    }
  });
}

const syncFoodMenu = async (franchise, userCity) => {
  return new Promise(async (resolve, reject) => {
    try {
      const idMain = '611ac8fc54cd91003ff1d1e5';
      const idLegacy = '610c20467be23c0034a5d05f';

      // const foodCategory = await CategoryModel.find({
      //   company: idLegacy,
      //   deletedAt: {
      //     $exists: false,
      //   }
      // });

      // console.log('result', foodCategory.length, foodCategory)

      const foodCategory = await CategoryModel.updateMany({
        company: idLegacy,
        deletedAt: {
          $exists: false,
        }
      }, {
        $set: {
          company: idMain,
        },
      }, {
        upsert: false,
        new: true,
      });

      const foodProduct = await ProductModel.updateMany({
        company: idLegacy,
        deletedAt: {
          $exists: false,
        }
      }, {
        $set: {
          company: idMain,
        },
      }, {
        upsert: false,
        new: true,
      });

      console.log('result', foodProduct)

      const foodProductComplement = await ProductComplementModel.updateMany({
        company: idLegacy,
        deletedAt: {
          $exists: false,
        }
      }, {
        $set: {
          company: idMain,
        },
      }, {
        upsert: false,
        new: true,
      });

      console.log('result', foodProductComplement)

      const foodProductComplementItem = await ProductComplementItemModel.updateMany({
        company: idLegacy,
        deletedAt: {
          $exists: false,
        }
      }, {
        $set: {
          company: idMain,
        },
      }, {
        upsert: false,
        new: true,
      });

      console.log('result', foodProductComplementItem)

      resolve(foodCategory);
    } catch (error) {
      return reject(error);
    }
  });
}

const checkExistUrlImage = async (photo) => {
  return new Promise(async (resolve, reject) => {
    const url = 'https://toopdelivery.com.br/upload/' + photo;

    try {
      if (
        photo &&
        typeof photo === 'string' &&
        String(photo).length > 4
      ) {


        const response = await axios.get(url, {
          responseType: "arraybuffer",
        });

        if (response.data) {
          console.log("image exists", url);
          return resolve(true)
        } else {
          console.log("image doesn't exist", url);
          return resolve(false)
        }
      } else {
        return resolve(true)
      }
    } catch (error) {
      console.log('- erro image', url)
      return resolve(false);
    }
  })
}

const syncCompaniesMenuFood = async (s3, franchise, userCity, login) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Legacy Companies
      const mtMerchant = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'json', 'mt_merchant.json')));
      const mtFoodCategory = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'json', 'mt_category.json')));
      const mtFoodProduct = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'json', 'mt_item.json')));
      const listCompanies = [];

      console.log('FRANQUIA ATUAL', login);
      // Find Companies User
      for await (const comp of mtMerchant) {
        if (String(comp.city).trim().toLowerCase() === userCity) {

          console.log('CompanyName:', typeof comp.merchant_id, comp.merchant_id, comp.restaurant_name)

          // switch (Number(comp.merchant_id)) {
          //   case 227:
          //   case 474:
          //   case 810:
          //     console.log('PULLLOUUU:', comp.merchant_id, comp.restaurant_name)
          //     continue;
          //     break;
          //   case 51:
          //   case 88:
          //   case 209:
          //   case 219:
          //   case 355:
          //   case 356:
          //   case 401:
          //   case 428:
          //   case 493:
          //   case 537:
          //   case 560:
          //   case 640:
          //   case 649:
          //   case 706:
          //   case 728:
          //   case 763:
          //   case 819:
          //     // CAMARÃO, filé
          //     console.log('PULLLOUUU:', comp.merchant_id, comp.restaurant_name)
          //     continue;
          //     break;
          //   default:
          //     break;
          // }

          console.log(1);
          // Create Group
          const payloadGroup = {
            // images: ['https://toopdelivery.sfo3.digitaloceanspaces.com/producthomolog/2d6ce3eb-036d-490d-ad2d-26bafc9e068f.png'],
            // status: (comp.status === 'active') ? true : false,
            franchise: franchise._id,
            name: String(comp.restaurant_name).trim(),
            // description: String(comp.restaurant_slug).trim(),
          };
          console.log(2);
          const group = await GroupModel.findOneAndUpdate({
            name: String(comp.restaurant_name).trim(),
            franchise: franchise._id,
          }, {
            $set: payloadGroup,
          }, {
            upsert: false,
            new: true,
          }).lean();
          console.log(3);
          // Create Segment
          const segment = await SegmentModel.findOneAndUpdate({
            name: 'RESTAURANTES',
            franchise: franchise._id,
          }, {
            $set: {
              name: 'RESTAURANTES',
              franchise: franchise._id,
              // status: true,
              // images: ['https://toopdelivery.sfo3.digitaloceanspaces.com/producthomolog/2d6ce3eb-036d-490d-ad2d-26bafc9e068f.png'],
            }
          }, {
            upsert: false,
            new: true,
          }).lean();
          console.log(4);
          // Create Company
          const payloadCompany = {
            franchise: franchise._id,
            name: String(comp.restaurant_name).trim(),
            groups: group._id,
            // description: String(comp.restaurant_slug).trim(),
            // status: (comp.status === 'active') ? true : false,
            // address: String(comp.street).trim(),
            // shoppingFlow: 'MENU',
            // type: 'restaurant',
            // phone: String(comp.restaurant_phone || comp.contact_phone).trim().replace(/[^0-9]/g, ''),
            // segment: segment._id,
            // images: ['https://toopdelivery.sfo3.digitaloceanspaces.com/producthomolog/2d6ce3eb-036d-490d-ad2d-26bafc9e068f.png'],
            // location: {
            //   coordinates: [Number(comp.lontitude), Number(comp.latitude)],
            //   type: "Point"
            // },
          }
          console.log(5);
          const company = await CompanyModel.findOneAndUpdate({
            name: String(comp.restaurant_name).trim(),
            franchise: franchise._id,
          }, {
            $set: payloadCompany
          }, {
            upsert: false,
            new: true,
          }).lean();
          console.log(6);
          for await (const category of mtFoodCategory) {
            if (Number(category.merchant_id) === Number(comp.merchant_id)) {
              // console.log('CATEGORIA FOOD', category.category_name);
              console.log(7);
              // Insert Food Category
              const payloadFoodCategory = {
                name: String(category.category_name).trim(),
                company: company._id,
              }

              const upsertFoodCategory = await CategoryModel.findOneAndUpdate({
                name: String(category.category_name).trim(),
                company: company._id,
              }, {
                $set: payloadFoodCategory
              }, {
                upsert: true,
                new: true,
              }).lean();

              // console.log('companyaa', company._id)
              let countProduct = 0;
              for await (const product of mtFoodProduct) {
                try {
                  if (Number(category.merchant_id) === Number(product.merchant_id)) {
                    if (typeof product.category === 'string' && String(product.category).length) {
                      const catProd = JSON.parse(product.category);
                      if (Number(category.cat_id) === Number(catProd[0])) {
                        console.log('__PRODUTO:', countProduct++, String(product.item_name || '').trim());

                        let photoProduct = 'https://toopdelivery.sfo3.digitaloceanspaces.com/producthomolog/2d6ce3eb-036d-490d-ad2d-26bafc9e068f.png';

                        const checkImage = await checkExistUrlImage(product.photo);

                        if (
                          product.photo &&
                          typeof product.photo === 'string' &&
                          String(product.photo).length > 4 &&
                          checkImage
                        ) {

                          // Insert Food Product
                          const payloadFoodProduct = {
                            company: company._id,
                            // images: [photoProduct],
                            name: String(product.item_name || '').trim(),
                            category: upsertFoodCategory._id,
                            description: String(product.item_description || '').trim(),
                            price: 1
                          }

                          const upsertFoodProduct = await ProductModel.findOneAndUpdate({
                            name: String(product.item_name || '').trim(),
                            category: upsertFoodCategory._id,
                            company: company._id,
                          }, {
                            $set: payloadFoodProduct
                          }, {
                            upsert: true,
                            new: true,
                          }).lean();

                          const url = 'https://toopdelivery.com.br/upload/' + product.photo;

                          const response = await axios.get(url, {
                            responseType: "arraybuffer",
                          });

                          const nameUuid = upsertFoodProduct._id;

                          sharp(response.data)
                            .toFormat('jpg')
                            .toBuffer()
                            .then(async (data) => {
                              params = {
                                Bucket: `${process.env.S3_SPACES_BUCKET_PRODUCTS}`,
                                Key: `${process.env.S3_SPACES_BUCKET_PRODUCTS_FOLDER}/${nameUuid}.jpg`,
                                Body: Buffer.from(data, "base64"),
                                ACL: "public-read",
                                ContentEncoding: "base64",
                                ContentType: `image/jpg`,
                              };
                              const {
                                Location
                              } = await s3.upload(params).promise();

                              photoProduct = Location;

                              // Update Food Product
                              await ProductModel.findByIdAndUpdate(upsertFoodProduct._id, {
                                $set: {
                                  images: [photoProduct],
                                }
                              }, {
                                upsert: true,
                                new: true,
                              }).lean();

                              // console.log('URL FINAL', photoProduct)
                            });
                        } else {
                          // Insert Food Product
                          const payloadFoodProduct = {
                            company: company._id,
                            images: [photoProduct],
                            name: String(product.item_name || '').trim(),
                            category: upsertFoodCategory._id,
                            description: String(product.item_description || '').trim(),
                            price: 1
                          }

                          await ProductModel.findOneAndUpdate({
                            name: String(product.item_name || '').trim(),
                            category: upsertFoodCategory._id,
                            company: company._id,
                          }, {
                            $set: payloadFoodProduct
                          }, {
                            upsert: true,
                            new: true,
                          }).lean();
                        }



                      }
                    }
                  }
                } catch (error) {
                  console.log('deu erro', product)
                  console.log('deu erro222', error)
                }
              }
            }

          }

        }
      }

      // console.log('Companies', listCompanies.length)

      // resolve(listCompanies);
      resolve(true);
    } catch (error) {
      return reject(error);
    }
  });
}

const syncProductMarket = async (s3, franchise, userCity) => {
  return new Promise(async (resolve, reject) => {
    try {
      let countProduct = 0;
      const idMerchant = 474;
      // HOMOLOGAÇÃO
      // let departmentId = '61282138198466004059a8fd'; // OUTROS HOMOLOGAÇÃO
      // const companyId = '610ae97e623795490425a1e9'; // HOMOLOGAÇÃO
      // // PRODUÇÃO
      let departmentId = '61282145ec9abb00343939d7'; // OUTROS PRODUCTION
      const companyId = '610aedce8548d0496be9ee1c'; // PRODUCTION

      console.log('fraaanchise', franchise)
      console.log('userCity', userCity, idMerchant)
      // Legacy Companies
      const mtMerchant = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'json', 'mt_merchant.json')));
      const mtFoodCategory = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'json', 'mt_category.json')));
      const mtFoodProduct = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'json', 'mt_item.json')));
      const listCompanies = [];
      // console.log('FRANQUIA ATUAL', login);

      let countRegister = 0;
      // Find Companies User
      for await (const comp of mtMerchant) {
        if (String(comp.city).trim().toLowerCase() === userCity) {
          if (Number(String(comp.merchant_id).trim()) === Number(idMerchant)) {
            console.log('CompanyName:', typeof comp.merchant_id, comp.merchant_id, comp.restaurant_name)

            for await (const category of mtFoodCategory) {
              if (Number(category.merchant_id) === Number(idMerchant)) {


                const marketDepartment = await MarketDepartmentModel.findOneAndUpdate({
                  suggesteds: {
                    $regex: ".*" + String(category.category_name).trim().toLowerCase() + ".*",
                    $options: "i"
                  },
                  franchise: franchise._id,
                }, {
                  $set: {
                    franchise: franchise._id,
                    suggesteds: [String(category.category_name).trim()],
                    showInApp: true,
                    status: true,
                    name: String(category.category_name).trim().toUpperCase(),
                  }
                }, {
                  upsert: true,
                  new: true,
                }).lean();

                console.log('1', marketDepartment)
                if (marketDepartment && marketDepartment._id) {
                  departmentId = marketDepartment._id;
                }

                console.log('CATEGORIA PRODUCT', category.category_name, marketDepartment);

                for await (const product of mtFoodProduct) {
                  try {
                    if (Number(category.merchant_id) === Number(product.merchant_id)) {
                      if (typeof product.category === 'string' && String(product.category).length) {
                        const catProd = JSON.parse(product.category);
                        if (Number(category.cat_id) === Number(catProd[0])) {

                          console.log(countRegister++ + '/' + mtFoodProduct.length, '__PRODUTO:', countProduct++, String(product.item_name || '').trim());

                          let photoProduct = 'https://toopdelivery.sfo3.digitaloceanspaces.com/producthomolog/2d6ce3eb-036d-490d-ad2d-26bafc9e068f.png';

                          const checkImage = await checkExistUrlImage(product.photo);

                          // countRegister++
                          // if (countRegister >= 10) {
                          //   continue;
                          // }

                          if (
                            product.photo &&
                            typeof product.photo === 'string' &&
                            String(product.photo).length > 4 &&
                            checkImage
                          ) {

                            // Insert Food Product
                            const payloadProductMarket = {
                              name: String(product.item_name || '').trim(),
                              keywords: ['petshop', 'pet shop'],
                              description: String(product.item_description || '').trim(),
                              price: 1,
                              company: companyId,
                              copyright: false,
                              department: [departmentId],
                              // images: [photoProduct],
                            }

                            const upsertFoodProduct = await MarketProductModel.findOneAndUpdate({
                              name: String(product.item_name || '').trim(),
                              department: [departmentId],
                              company: companyId,
                            }, {
                              $set: payloadProductMarket
                            }, {
                              upsert: true,
                              new: true,
                            }).lean();

                            const url = 'https://toopdelivery.com.br/upload/' + product.photo;

                            const response = await axios.get(url, {
                              responseType: "arraybuffer",
                            });

                            const nameUuid = upsertFoodProduct._id;

                            sharp(response.data)
                              .toFormat('jpg')
                              .toBuffer()
                              .then(async (data) => {
                                params = {
                                  Bucket: `${process.env.S3_SPACES_BUCKET_PRODUCTS}`,
                                  Key: `${process.env.S3_SPACES_BUCKET_PRODUCTS_FOLDER}/${nameUuid}.jpg`,
                                  Body: Buffer.from(data, "base64"),
                                  ACL: "public-read",
                                  ContentEncoding: "base64",
                                  ContentType: `image/jpg`,
                                };
                                const {
                                  Location
                                } = await s3.upload(params).promise();

                                photoProduct = Location;

                                // Update Food Product
                                await MarketProductModel.findByIdAndUpdate(upsertFoodProduct._id, {
                                  $set: {
                                    images: [photoProduct],
                                  }
                                }, {
                                  upsert: false,
                                  new: true,
                                }).lean();

                                // console.log('URL FINAL', photoProduct)
                              });
                          } else {
                            // Insert Food Product
                            const payloadProductMarket = {
                              name: String(product.item_name || '').trim(),
                              keywords: ['petshop', 'pet shop'],
                              description: String(product.item_description || '').trim(),
                              price: 1,
                              company: companyId,
                              copyright: false,
                              department: [departmentId],
                              images: [photoProduct],
                            }

                            const upsertFoodProduct = await MarketProductModel.findOneAndUpdate({
                              name: String(product.item_name || '').trim(),
                              department: [departmentId],
                              company: companyId,
                            }, {
                              $set: payloadProductMarket
                            }, {
                              upsert: true,
                              new: true,
                            }).lean();
                          }

                        }
                      }
                    }
                  } catch (error) {
                    console.log('deu erro', product)
                    console.log('deu erro222', error)
                  }
                }
              }

            }

          }

        }
      }
      resolve(true);
    } catch (error) {
      return reject(error);
    }
  });
}

const loopFranchisesAll = async (s3, login, mtAdminUser) => {
  return new Promise(async (resolve, reject) => {
    try {
      let dataAdminUser;
      let userCity;
      let userFranchise;
      let userCompanies = [];
      let listLegacy = [];
      console.log('vai iniciar', login)
      // Find User Login
      for await (const user of mtAdminUser) {
        listLegacy.push(String(user.email_address).trim().toLowerCase());
        if (String(user.email_address).trim().toLowerCase() === login.trim().toLowerCase()) {
          dataAdminUser = user;
        }
      }

      // Not Found User login
      if (!dataAdminUser) {
        return resolve(false);
        // return res.status(400).send({
        //   message: "Nenhum usuário encontrado com esse login na base de dados legado",
        //   login,
        // });
      }

      // User city
      userCity = String(dataAdminUser.cidade).trim().toLowerCase();

      // Search by Users
      userFranchise = await getUserByEmail(login.trim());
      console.log('franchise', userFranchise, login.trim())
      if (!userFranchise) {
        console.log('ERRRORR 123');
        return resolve(false);
        // return res.status(400).send({
        //   message: "Nenhuma franquia/usuário encontrada com esse login",
        //   login,
        // });
      }

      if (userFranchise.franchises && Array.isArray(userFranchise.franchises)) {
        for await (const franchise of userFranchise.franchises) {
          // Sync Companies
          // const syncCompany = await syncCompanies(franchise, userCity);
          // const syncCompany = await syncDeliverymen(franchise, userCity, login.trim());
          // const syncCompanyFood = await syncCompaniesMenuFood(s3, franchise, userCity, login.trim());
          // const syncCompany = await syncCheckDeliveryCompanies(franchise, userCity);
          // const syncCompany = await syncFoodMenu(franchise, userCity);
          const syncCompany = await syncProductMarket(s3, franchise, userCity);
          // userCompanies.push(syncCompany);
        }
      }

      return resolve(true);
    } catch (error) {
      return reject(error);
    }
  });
}

const listFranchiseLegacy = [
  "jo.driel@hotmail.com",
  // "ildesoliver@gmail.com",
  // "walace_quirino@hotmail.com",
  // "cristiano.oliveira72@gmail.com",
  // "otavam@hotmail.com",


  // Reboot
  // "jedercastro@gmail.com",
  // "rafael.itaete@gmail.com",
  // "klebsonejane@gmail.com",
  // "sandersonmedeiros1994@gmail.com",


  // "joaoneto2006@gmail.com",
  // "edsarmmn@gmail.com",
  // "david1maiara@gmail.com",
  // "wesley_lucca@outlook.com",
  // "ilu4n91@gmail.com",
  // "contato@clickinsight.com.br",
  // "tullioclsantos@gmail.com",
  // "rosorocaba@gmail.com",
  // "castro.morgante@protonmail.com",
  // "marcel@gmail.com",
  // "michaegoncalves1985@gmail.com",
  // "anderson@gmail.com",
  // "toopdeliverybnu@gmail.com",
  // "marquesmichel753@gmail.com",
  // "delimaerikis@gmail.com",
  // "frassetto.anderson@gmail.com",
  // "edukf90@gmail.com",
  // "ionaldomp@yahoo.com.br",
  // "toopdeliverybc@gmail.com",
  // "maik_adiel@hotmail.com",
  // "delimaerikis@gmail.com",
  // "delimaerikis@gmail.com",
  // "nsdanttas@gmail.com",
  // "impbusyman@gmail.com",
  // "thiagoflesh@yahoo.com",
  // "robsongrando@hotmail.com",
  // "josimaralvesoliveira1982@gmail.com",
  // "vanderleigb@live.com",
  // "toopdelivery.ribeirao@gmail.com",
  // "dagavaki@gmail.com",
  // "atendimento.toopdelivery@gmail.com",
  // "alessander.thyago@gmail.com",
  // "wagner-oliveira9@hotmail.com",
  // "claudionorvti@gmail.com",
  // "55mobimobilidadeurbana@gmail.com",
  // "wagner-oliveira9@hotmail.com",
  // "ibeandrade@gmail.com",
  // "toopdeliveryriobrancoac@gmail.com",
  // "fernandesnfs@yahoo.com.br",
  // "marllonma13@gmail.com",
  // "jmichelin27@hotmail.com",
  // "ricardogazoni@hotmail.com",
  // "luccafantauzzi@hotmail.com",
  // "toopdelivery.pf@gmail.com",
  // "erickszubek@gmail.com",
  // "cir-oliveira@hotmail.com",
  // "marcioreischagas@gmail.com",
  // "toopdeliveryrj@gmail.com",
  // "marcosmais12@hotmail.com",
  // "emersonpires.cultura@gmail.com",
  // "gabriel_souuza@outlook.com",
  // "divo20152016@gmail.com",
  // "profivanfranco@gmail.com",
  // "lcfelix@uol.com.br",
  // "churchnova1@gmail.com",
  // "tassotmuller@gmail.com",
  // "castilhobruno@outlook.com.br"
];

module.exports = async (req, res) => {
  try {
    const login = req.params.login;
    const syncSuccess = [];

    // Space
    const spaceEndPoint = new aws.Endpoint(`${process.env.S3_SPACES_URL}`);
    const s3 = new aws.S3({
      endpoint: spaceEndPoint,
      accessKeyId: `${process.env.S3_SPACES_KEY}`,
      secretAccessKey: `${process.env.S3_SPACES_SECRET}`,
    });

    if (typeof login !== 'string' || login.trim().length <= 0) {
      return res.status(400).send({
        message: "Login inválido",
      });
    }

    // Files DbLegacy
    const mtAdminUser = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'json', 'mt_admin_user.json')));

    let countLoopError = 0;
    for await (const log of listFranchiseLegacy) {
      const loopAll = await loopFranchisesAll(s3, log, mtAdminUser);
      if (loopAll) {
        syncSuccess.push(log);
        console.log('SUCCESS', syncSuccess.length, log)
      } else {
        console.log('ERROR', countLoopError++, log)
      }
    }

    res.send({
      status: 200,
      message: "Sucesso ao Atualizar Empresa",
      syncSuccess,
      listFranchiseLegacy,
    });
  } catch (dadosDoErro) {
    return res.status(400).send({
      message: "Falha ao Atualizar Empresa",
      Error: dadosDoErro
    });
  }
};
