const { Transactions, Categories, Safes } = require("../models");
const { Op } = require("sequelize");

// Daily Report
module.exports = {
  getDaily: async (req, res) => {
    const user = req.user;
    let date = req.query.date;
    try {
      const expense = await Transactions.findAll({
        where: {
          user_id: user.id,
          type: "expense",
          createdAt: {
            [Op.lt]: new Date(date).setDate(new Date(date).getDate() + 1),
            [Op.gt]: new Date(date),
          },
        },
        include: [
          {
            model: Categories,
            as: "Categories",
            attributes: ["categoryName", "image_url"],
          },
        ],
      });

      if (!expense) {
        return res.status(404).json({
          status: "failed",
          message: "transaction not found",
          data: expense,
        });
      }

      const addIncome = await Transactions.findAll({
        where: {
          user_id: user.id,
          type: "addIncome",
          createdAt: {
            [Op.lt]: new Date(date).setDate(new Date(date).getDate() + 1),
            [Op.gt]: new Date(date),
          },
        },
        attributes: {
          exclude: ["category_id", "detailExpense"],
        },
        include: {
          model: Safes,
          as: "Safe",
          attributes: ["safeName", "openingBalance"],
        },
      });

      if (!addIncome) {
        return res.status(404).json({
          status: "failed",
          message: "transaction not found",
          data: addIncome,
        });
      }
      if (expense.length == 0) {
        res.status(200).json({
          status: "success",
          message: "daily report transaction retrieved successfully",
          expense: "No expenses today",
          addIncome: addIncome,
        });
      }

      if (addIncome.length == 0) {
        res.status(200).json({
          status: "success",
          message: "daily report transaction retrieved successfully",
          expense: expense,
          addIncome: "No incomes today",
        });
      }
      return res.status(200).json({
        status: "success",
        message: "daily report transaction retrieved successfully",
        expense: expense,
        addIncome: addIncome,
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
    let date = req.query.date;
    try {
      const expense = await Transactions.findAll({
        where: {
          user_id: user.id,
          type: "expense",
          createdAt: {
            [Op.lt]: new Date(date).setDate(new Date(date).getDate() + 1),
            [Op.gt]: new Date(date).setDate(1),
          },
        },
        include: [
          {
            model: Categories,
            as: "Categories",
            attributes: ["categoryName", "image_url"],
          },
        ],
      });
      const month = new Date(expense.createdAt).getMonth() + 1;
      console.log(month);

      if (!expense) {
        return res.status(404).json({
          status: "failed",
          message: "Transaction not found",
        });
      }

      const addIncome = await Transactions.findAll({
        where: {
          user_id: user.id,
          type: "addIncome",
          createdAt: {
            [Op.lt]: new Date(date).setDate(new Date(date).getDate() + 1),
            [Op.gt]: new Date(date).setDate(1),
          },
        },
        attributes: {
          exclude: ["category_id", "detailExpense"],
        },
        include: {
          model: Safes,
          as: "Safe",
          attributes: ["safeName", "openingBalance"],
        },
      });
      if (expense.length == 0) {
        res.status(200).json({
          status: "success",
          message: "daily report transaction retrieved successfully",
          expense: "No expenses this month",
          addIncome: addIncome,
        });
      }

      if (addIncome.length == 0) {
        res.status(200).json({
          status: "success",
          message: "daily report transaction retrieved successfully",
          expense: expense,
          addIncome: "No incomes this month",
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Monthly report transaction retrieved successfully",
        expense: expense,
        addIncome: addIncome,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "error",
        error: { message: "Internal Server Error" },
      });
    }
  },
};
