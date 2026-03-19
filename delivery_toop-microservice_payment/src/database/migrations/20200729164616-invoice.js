'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    return await queryInterface
        .addIndex('Invoices', ['payment', 'order', 'createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface
        .removeIndex('Invoices', ['payment', 'order', 'createdAt']);
  },
};
