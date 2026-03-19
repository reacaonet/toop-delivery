const Person = require("../../models/Person/PersonModel");
const Customer = require("../../models/CustomerModel");
const Passenger = require("../../models/Mobility/Passenger/PassengerModel");
const LogModel = require("../../models/LogModel");

module.exports = async (req, res) => {
  try {
    const id = req.params.id;

    // Find and update passenger with deletedAt field  by person ID
    const passenger = await Passenger.findOneAndUpdate({ person: id }, { deletedAt: Date.now() });
    // Find and update customer document with deletedAt field by person ID
    const customer = await Customer.findOneAndUpdate({ person: passenger.person }, { deletedAt: Date.now() });
    // Find and update person document with deletedAt field by person ID
    await Person.findOneAndUpdate({ _id: customer.person }, { deletedAt: Date.now() });

    res.status(200).json({ message: "User have been successfully deleted." });
  } catch (error) {
    await LogModel.create({
      path: 'src/controllers/Person/DeleteController.js',
      error: error?.message,
      method: 'DeleteController',
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


    res.status(500).json({ message: "An error occurred while deleting user." });
  }
};
