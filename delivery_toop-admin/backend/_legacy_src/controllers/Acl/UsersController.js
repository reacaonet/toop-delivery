const jwt = require("jsonwebtoken");

/** Model */
const userModel = require("../../models/UserModel");
const LogModel = require('../../models/LogModel');

const users = async (req, res) => {
  try {
    let token = req.headers["x-access-token"] || req.headers["authorization"];

    if (token !== undefined && token != null && typeof token == "string" && token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trim();
    } else {
      return res
        .status(401)
        .json({
          success: false,
          message: "not authorized",
        })
        .end();
    }

    const decode = await getInfoToken(token);
    if (!decode) return res.status(401).send({});

    // Get User Data by token
    const userLogged = await userModel
      .findOne(
        {
          _id: decode._id,
          // accessToken: token,
        },
        {
          isRoot: 1,
          name: 1,
          email: 1,
          accessToken: 1,
          refreshToken: 1,
          person: 1,
          accessToken: 1,
          refreshToken: 1,
        },
      )
      .populate("person", {
        name: 1,
        city: 1,
        phone: 1,
      })
      .populate("company", {
        name: 1,
        type: 1,
        shoppingFlow: 1,
      })
      .populate("franchises", {
        name: 1,
      })
      .lean();

    if (!userLogged) {
      return res.status(401).send({});
    }

    let roles = [2]; // Market / Restaurant
    const permissions = [];
    if (userLogged.company && userLogged.franchises && userLogged.franchises.length <= 0 && !userLogged.isRoot) {
      // userLogged.company.shoppingFlow
      // Type permissions to User
      let typePermissions = userLogged.company.shoppingFlow || "MENU";

      if (!userLogged.company.shoppingFlow) {
        switch (userLogged.company.type) {
          case "restaurant":
            typePermissions = "MENU";
            break;
          case "supermarket":
            typePermissions = "PRODUCT";
            break;
        }
      }

      // userLogged.company.shoppingFlow
      switch (typePermissions) {
        case "MENU":
          permissions.push({
            id: "5e8658970775173a7838ea72",
            name: "accessToFoodMenu",
            route: "delivery-products",
            level: 1,
            title: "Menu module",
          });
          permissions.push({
            id: "5e87658c3080b03a40fe4b82",
            name: "accessToFoodOrders",
            route: "shopping-cart/restaurant",
            level: 1,
            title: "Food Orders module",
          });
          permissions.push({
            id: "5e8765fb3080b03a40fe4b84",
            name: "accessToHoursCompany",
            route: "company/opening-hours",
            level: 1,
            title: "Company Opening Hours module",
          });
          permissions.push({
            id: "5e8765fb3080b03a40fe4b86",
            name: "accessToCompanyDelivery",
            route: "company/delivery",
            level: 1,
            title: "Company Delivery",
          });
          permissions.push({
            id: "5ee10e8edbfda3d9b329ffcf",
            name: "accessToTransactions",
            route: "/finance/invoice",
            level: 1,
            title: "Permission Transactions",
          });
          permissions.push({
            id: "61365ba3d3b731d4eb8f1104",
            name: "accessToReportFinance",
            route: "/report/financial-company",
            level: 1,
            title: "Report Finance",
          });

          break;
        case "PRODUCT":
          permissions.push({
            id: "5e8765fb3080b03a40fe4b86",
            name: "accessToCompanyDelivery",
            route: "company/delivery",
            level: 1,
            title: "Company Delivery",
          });
          permissions.push({
            id: "5e8765183080b03a40fe4b81",
            name: "accessToRegisterProduct",
            route: "register-product",
            level: 1,
            title: "Product List module",
          });
          permissions.push({
            id: "5e8765de3080b03a40fe4b83",
            name: "accessToMarketOrders",
            route: "shopping-cart/supermarket",
            level: 1,
            title: "Market Orders module",
          });
          permissions.push({
            id: "5e8765fb3080b03a40fe4b84",
            name: "accessToHoursCompany",
            route: "company/opening-hours",
            level: 1,
            title: "Company Opening Hours module",
          });
          permissions.push({
            id: "5ee10e8edbfda3d9b329ffcf",
            name: "accessToTransactions",
            route: "/finance/invoice",
            level: 1,
            title: "Permission Transactions",
          });
          permissions.push({
            id: "61365ba3d3b731d4eb8f1104",
            name: "accessToReportFinance",
            route: "/report/financial-company",
            level: 1,
            title: "Report Finance",
          });
          break;
        default:
          break;
      }
    }

    if ((userLogged.franchises && userLogged.franchises.length > 0) || userLogged.isRoot) {
      roles = [1]; // Administrator
      permissions.push({
        id: "ECBR",
        name: "accessToGlobal",
        level: 1,
        title: "Dashboard module",
      });
    }

    if (userLogged.franchises && userLogged.franchises.length > 0 && !userLogged.isRoot) {
      permissions.push({
        id: "61365cabfb205488d1f1d407",
        name: "accessToFranchises",
        route: "/report/financial",
        level: 1,
        title: "Franchise",
      });
    }

    if (userLogged.isRoot) {
      roles = [1]; // Administrator
      permissions.push({
        id: "ECBR-ROOT",
        name: "accessToRoot",
        level: 1,
        title: "Franchises Module",
      });
    }

    const respData = {
      id: userLogged._id || undefined,
      username: userLogged.email,
      // password: 'demo',
      email: userLogged.email,
      accessToken: userLogged.accessToken,
      refreshToken: userLogged.refreshToken,
      roles,
      permissions,
      company: userLogged.company,
      pic: "./assets/media/users/default.jpg",
      fullname: userLogged.name,
      occupation: "ecbr",
      companyName: "ecbr",
      phone: userLogged.person && userLogged.person.phone ? userLogged.person.phone : "",
      address: {
        addressLine: "ecbr",
        city: "ecbr",
        state: "ecbr",
        postCode: "ecbr",
      },
      socialNetworks: {
        linkedIn: "ecbr",
        facebook: "ecbr",
        twitter: "ecbr",
        instagram: "ecbr",
      },
    };

    return res.status(200).send(respData);
  } catch (err) {
    await LogModel.create({
      path: 'src/controllers/Acl/UsersController.js',
      error: err?.message,
      method: 'users',
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

    console.log(err);
    return res.status(501).end();
  }
};

const getInfoToken = async token => {
  return new Promise(resolve => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        return resolve(null);
      }

      return resolve(decode);
    });
  });
};

module.exports = users;
