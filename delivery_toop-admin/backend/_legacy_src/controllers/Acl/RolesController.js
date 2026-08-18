const LogModel = require("../../models/LogModel");

const roles = async (req, res) => {
  try {

    return res.status(200).send([]);

    return res.status(200).send([{
        id: 1,
        title: 'Administrator',
        isCoreRole: true,
        permissions: ['ECBR','5e8658970775173a7838ea72','5e8764413080b03a40fe4b80', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
      },
      // {
      //   id: 2,
      //   title: 'Manager',
      //   isCoreRole: false,
      //   permissions: [3, 4, 10]
      // },
      // {
      //   id: 3,
      //   title: 'Guest',
      //   isCoreRole: false,
      //   permissions: []
      // }
    ])

  } catch (err) {
  await LogModel.create({
    path: 'src/controllers/Acl/RolesController.js',
    error: err?.message,
    method: 'roles',
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

    return res.status(501).end()
  }
}

module.exports = roles
