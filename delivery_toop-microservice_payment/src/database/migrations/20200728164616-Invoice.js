/* eslint-disable new-cap */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Invoices', {
      id: {
        type: Sequelize.DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      payment: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      order: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      ownerPerson: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      ownerCompany: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      person: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      company: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      shoppingCart: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DataTypes.FLOAT,
        allowNull: false,
      },
      totalPayment: {
        type: Sequelize.DataTypes.FLOAT,
        allowNull: false,
      },
      typeInvoice: {
        type: Sequelize.DataTypes.ENUM({values: ['INPUT', 'OUTPUT']}),
        allowNull: false,
      },
      statusInvoice: {
        type: Sequelize.DataTypes.ENUM({values: ['WAITING', 'CONFIRMED']}),
        allowNull: false,
      },
      paymentMethodCompany: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.DataTypes.NOW,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.DataTypes.NOW,
        allowNull: false,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Invoices');
  },
};
