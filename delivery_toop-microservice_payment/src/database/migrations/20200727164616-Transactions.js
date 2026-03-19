/* eslint-disable new-cap */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Transactions', {
      id: {
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      PaymentId: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      CapturedDate: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      MerchantId: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      Nsu: {
        type: Sequelize.DataTypes.BIGINT,
        allowNull: false,
      },
      AuthorizationCode: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      AuthorizationDate: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      Status: {
        type: Sequelize.DataTypes.BIGINT,
        allowNull: false,
      },
      StatusDescription: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      CardNumber: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      OrderId: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      Schedules: {
        type: Sequelize.DataTypes.STRING(100000),
        allowNull: false,
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
    return queryInterface.dropTable('Transactions');
  },
};
