'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Safes extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Safes.belongsTo(models.Users, { foreignKey: 'user_id', as: 'user' })
            Safes.hasMany(models.Transactions, { foreignKey: 'safe_id', as: 'transaction' })
        }
    };
    Safes.init({
        user_id: DataTypes.INTEGER,
        safeName: DataTypes.STRING,
        amount: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Safes',
    });
    return Safes;
};