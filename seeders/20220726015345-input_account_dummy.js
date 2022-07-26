'use strict';
const authController = require("../controllers/authController")

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Accounts', [{
        email: "johndoe@gmail.com",
        password: await authController.encryptPassword("12345678"),
        userId: 1,
        userRoleId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "janedee@gmail.com",
        password: await authController.encryptPassword("12345678"),
        userId: 2,
        userRoleId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "barthlew@gmail.com",
        password: await authController.encryptPassword("12345678"),
        userId: 3,
        userRoleId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "abigailras@gmail.com",
        password: await authController.encryptPassword("12345678"),
        userId: 4,
        userRoleId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Accounts', null, {})
  }
};