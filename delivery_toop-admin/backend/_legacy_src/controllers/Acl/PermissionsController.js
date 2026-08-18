const LogModel = require("../../models/LogModel");

const permissions = async (req, res) => {
  try {
    return res.status(200).send([
      {
        id: "ECBR",
        name: "accessToGlobal",
        level: 1,
        title: "Dashboard module",
      },
      {
        id: "ECBR-ROOT",
        name: "accessToRoot",
        level: 1,
        title: "Franchises module",
      },
      {
        id: "5e8658970775173a7838ea72",
        name: "accessToCompanyCompany",
        route: "company/company",
        level: 1,
        title: "Dashboard module aa",
      },
      {
        id: "5e8764413080b03a40fe4b80",
        name: "accessToDashboard",
        route: "dashboard",
        level: 1,
        title: "Dashboard module aa",
      },
      {
        id: 1,
        name: "accessToECommerceModule",
        level: 1,
        title: "eCommerce module",
      },
      {
        id: 2,
        name: "accessToAuthModule",
        level: 1,
        title: "Users Management module",
      },
      {
        id: 3,
        name: "accessToMailModule",
        level: 1,
        title: "Mail module",
      },
      {
        id: 4,
        name: "canReadECommerceData",
        level: 2,
        parentId: 1,
        title: "Read",
      },
      {
        id: 5,
        name: "canEditECommerceData",
        level: 2,
        parentId: 1,
        title: "Edit",
      },
      {
        id: 6,
        name: "canDeleteECommerceData",
        level: 2,
        parentId: 1,
        title: "Delete",
      },
      {
        id: 7,
        name: "canReadAuthData",
        level: 2,
        parentId: 2,
        title: "Read",
      },
      {
        id: 8,
        name: "canEditAuthData",
        level: 2,
        parentId: 2,
        title: "Edit",
      },
      {
        id: 9,
        name: "canDeleteAuthData",
        level: 2,
        parentId: 2,
        title: "Delete",
      },
      {
        id: 10,
        name: "canReadMailData",
        level: 2,
        parentId: 3,
        title: "Read",
      },
      {
        id: 11,
        name: "canEditMailData",
        level: 2,
        parentId: 3,
        title: "Edit",
      },
      {
        id: 12,
        name: "canDeleteMailData",
        level: 2,
        parentId: 3,
        title: "Delete",
      },
    ]);
  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/Acl/PermissionsController.js',
    error: err?.message,
    method: 'permissions',
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

    return res.status(501).end();
  }
};

module.exports = permissions;
