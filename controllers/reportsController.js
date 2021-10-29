const { Transactions, Categories, Safes } = require("../models");
const sequelize = require("sequelize");

// Daily Report
module.exports = {
    getDaily: async (req, res) => {
        const user = req.user;
        try {
            const expense = await Transactions.findAll({
                where: { user_id: user.id, type: 'expense' },
                attributes: [ 
                    [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
                    "category_id",
                    [sequelize.fn("sum", sequelize.col("expense")), "totalExpense"],
                    [sequelize.fn("count", sequelize.col("id")), "count"],
                ],
                group: ["date", "category_id"],
            });

            if (!expense) {
            return res.status(404).json({
                status: "failed",
                message: "transaction not found",
                data: expense,
            });
            }

            const addIncome = await Transactions.findAll({
                where: { user_id: user.id, type: 'addIncome' },
                attributes: [
                    [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
                    [sequelize.fn("sum", sequelize.col("expense")), "totalAddIncome"],
                    [sequelize.fn("count", sequelize.col("id")), "count"],
                ],
                group: ["date"],
            });

            if (!addIncome) {
            return res.status(404).json({
                status: "failed",
                message: "transaction not found",
                data: addIncome,
            });
            }

            return res.status(200).json({
                status: "success",
                message: "daily report transaction retrieved successfully",
                expense: expense, 
                addIncome: addIncome
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: "error",
                error: {
                    message: "Internal Server Error",
                },
            });
        }
    },

    // Monthly Report
    getMonthly: async (req, res) => {
        const user = req.user;
        try {
            const expense = await Transactions.findAll({
            where: { user_id: user.id, type: 'expense' },
            attributes: [
                [sequelize.fn("date_trunc","MONTH", sequelize.col("createdAt")), "Month"],
                "category_id",
                [sequelize.fn("sum", sequelize.col("expense")), "totalExpense"],
                [sequelize.fn("count", sequelize.col("id")), "count"],
            ],
            group: ["Month", "category_id"],
            });

            if (!expense) {
                return res.status(404).json({
                    status: "failed",
                    message: "Transaction not found"
                });
            }

            const addIncome = await Transactions.findAll({
                where: { user_id: user.id, type: 'addIncome' },
                attributes: [
                    [sequelize.fn("date_trunc","MONTH", sequelize.col("createdAt")), "Month"],
                    [sequelize.fn("sum", sequelize.col("expense")), "totalAddIncome"],
                    [sequelize.fn("count", sequelize.col("id")), "count"],
                ],
                group: ["Month"],
                });

            return res.status(200).json({
                status: "success",
                message: "Monthly report transaction retrieved successfully",
                expense: expense, 
                addIncome: addIncome
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: "error",
                error: { message: "Internal Server Error"},
            });
        }
    }
}