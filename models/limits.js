'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Limits extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Limits.belongsTo(models.Categories, {
                foreignKey: "category_id",
                as: "Category"
            })
            Limits.belongsTo(models.Users, {
                foreignKey: "user_id",
                as: "User"
            })
            Limits.hasMany(models.Transactions, { foreignKey: 'limit_id' })
        }
    };
    Limits.init({
        category_id: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        limit: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Limits',
    });
    return Limits;
};