'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
          'Invoices',
          'paymentDate', {
            type: Sequelize.DataTypes.DATE,
          },
          {transaction},
      );

      await queryInterface.addIndex('Invoices', ['paymentDate'], {
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn(
          'Invoices',
          'paymentDate', {
            transaction,
          },
      );

      // await transaction.rollback('Invoices', 'paymentDate', {transaction});
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
