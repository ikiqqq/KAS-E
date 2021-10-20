const { Transactions } = require("../models");
const sequelize = require("sequelize");

// Daily Report
module.exports = {
    getDaily: async (req, res) => {
        const user = req.user;
        try {
            const transaction = await Transactions.findAll({
                where: { user_id: user.id },
                attributes: [
                    [sequelize.fn("date_trunc","MONTH", sequelize.col("createdAt")), "date"],
                    [sequelize.fn("sum", sequelize.col("expense")), "totalExpense"],
                    [sequelize.fn("count", sequelize.col("id")), "count"],
                ],
                group: ["date"],
                // include: [{
                //     model: Limits,
                //     as: 'Limit',
                //     include: {
                //         model: Categories,
                //         as: "Category"
                //     }
                // },
                //     {
                //         model: Safes
                //     }
                // ],
            });

            if (!transaction) {
            return res.status(404).json({
                status: "failed",
                message: "transaction not found",
                data: transaction,
            });
            }

            return res.status(200).json({
                status: "success",
                message: "daily report transaction retrieved successfully",
                data: transaction,
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
            const transaction = await Transactions.findAll({
            where: { user_id: user.id },
            attributes: [
                [sequelize.fn("MONTH", sequelize.col("createdAt")), "Month"],
                [sequelize.fn("sum", sequelize.col("expense")), "totalExpense"],
                [sequelize.fn("count", sequelize.col("id")), "count"],
            ],
            group: ["Month"],
            });

            if (!transaction) {
                return res.status(404).json({
                    status: "failed",
                    message: "Transaction not found"
                    // data: transaction,
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Monthly report transaction retrieved successfully",
                data: transaction,
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