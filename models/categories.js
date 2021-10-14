"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Categories extends Model {
    static associate(models) {
      // Categories.hasMany(models.Limits, {
      //   foreignKey: "category_id",
      //   as: "Category",
      // });
    }
  }
  Categories.init(
    {
      categoryName: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Categories",
    }
  );
  return Categories;
};
