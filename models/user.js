'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Account, {
        foreignKey: "userId",
        as: "userid",
        onDelete: 'CASCADE'
      });
    }
  }
  User.init({
    nik: {
      type: DataTypes.STRING,
      unique: true,
    },
    nama_lengkap: DataTypes.STRING,
    gender: DataTypes.STRING,
    goldar: DataTypes.STRING,
    photo: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
    cascade: true,
  });
  return User;
};