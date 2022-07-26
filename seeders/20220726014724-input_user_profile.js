'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', [
      {
        nik: 1234567890123456,
        nama_lengkap: "John Doe",
        gender: "Pria",
        goldar: "AB",
        photo: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nik: 1234567899123456,
        nama_lengkap: "Jane Dee",
        gender: "Wanita",
        goldar: "B",
        photo: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nik: 1234567898123456,
        nama_lengkap: "Bartholomew Lew",
        gender: "Pria",
        goldar: "A",
        photo: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nik: 1234567897123456,
        nama_lengkap: "Abigail Raschford",
        gender: "Wanita",
        goldar: "O",
        photo: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {})
  }
};
