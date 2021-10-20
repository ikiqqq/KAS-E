const { Users, Limits, Safes, Transactions, Categories } = require("../models");
const Joi = require("joi");
const { Op } = require("sequelize");

module.exports = {
  postTransaction: async (req, res) => {
    const user = req.user;
    const body = req.body;

    try {
      const schema = Joi.object({
        user_id: Joi.number().required(),
        category_id: Joi.number().required(),
        safe_id: Joi.number().required(),
        detailExpense: Joi.string().required(),
        expense: Joi.number().required(),
      });

      const { error } = schema.validate(
        {
          user_id: user.id,
          category_id: body.category_id,
          safe_id: body.safe_id,
          detailExpense: body.detailExpense,
          expense: body.expense,
        },
        { abortEarly: false }
      );

      if (error) {
        return res.status(400).json({
          status: "failed",
          message: "Bad Request",
          errors: error["details"][0]["message"],
        });
      }

      const safe = await Safes.findOne({
        where: {
          id: body.safe_id,
        },
        // include: {
        //     model: Users,
        //     as: 'user'
        // }
      });
      // console.log("🚀 ~ file: transactionsController.js ~ line 43 ~ postTransaction:async ~ safe", safe)

      if (!safe) {
        return res.status(404).json({
          status: "failed",
          message: "Safe not found",
        });
      }
    //   if (safe.user.dataValues.id != user.id) {
    //     return res.status(400).json({
    //       status: "failed",
    //       message: "You are not authorized to do this action",
    //     });
    //   }

      const limit = await Limits.findOne({
        where: {
          // category_id: body.category_id,
          user_id: user.id,
        },
        // include: {
        //     model: Users,
        //     as: 'User'
        // }
      });
      // console.log("🚀 ~ file: transactionsController.js ~ line 74 ~ postTransaction:async ~ limit", limit)

      if (!limit) {
        return res.status(404).json({
          status: "failed",
          message: "Limit not found",
        });
      }
      // if (limit.User.id != user.id) {
      //     return res.status(400).json({
      //         status: 'failed',
      //         message: 'You are not authorized to do this action'
      //     })
      // }

      const create = await Transactions.create({
        user_id: user.id,
        category_id: body.category_id,
        safe_id: body.safe_id,
        detailExpense: body.detailExpense,
        expense: body.expense,
      });

      if (!create) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to save data to database",
        });
      }

      const findLimit = await Transactions.findAll({
        where: {
          category_id: body.category_id,
          user_id: user.id,
        },
      });

      let limitTransaction = findLimit.map((e) => {
        return e.dataValues.expense;
      });

      const sumLimitTransaction = limitTransaction.reduce((a, b) => a + b);

      const newLimit = limit.limit - sumLimitTransaction;
      console.log(
        "🚀 ~ file: transactionsController.js ~ line 147 ~ postTransaction:async ~ newLimit",
        newLimit
      );

      if (newLimit < 0) {
        return res.status(201).json({
          message: "Over limit ",
          data: newLimit,
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Successfully saved data to database",
        data: { create },
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        status: "failed",
        message: "Internal server error",
      });
    }
  },

  getAllTransaction: async (req, res) => {
    const user = req.user;
    let date = req.query.date;
    let where;

    try {
      if (date) {
        if (!date.match(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)) {
          return res.status(400).json({
            status: "failed",
            message: "Date format not match",
          });
        }
        let dateFrom = new Date(date);
        let dateTo = new Date(date).setDate(new Date(date).getDate() + 1);
        where = {
          user_id: user.id,
          createdAt: {
            [Op.between]: [dateFrom, dateTo],
          },
        };
      } else {
        where = {
          user_id: user.id,
        };
      }
      const transactions = await Transactions.findAll({
        where: where,
        include: [
          {
            model: Categories,
            as: "Categories",
            include:[{
              where:{
                user_id: user.id
              },
              model: Limits,
              as: "Limit"
            }]
          }],
      });

      if (transactions.length == 0) {
        return res.status(404).json({
          status: "failed",
          message: "Data not found",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Successfully retrieved data transactions",
        data: {
          transactions,
        },
      });
    } catch (error) {
      console.log(
        "🚀 ~ file: transactionsController.js ~ line 196 ~ getAllTransaction:async ~ error",
        error
      );
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
      });
    }
  },

  updateTransaction: async (req, res) => {
    const user = req.user;
    console.log(
      "🚀 ~ file: transactionsController.js ~ line 208 ~ updateTransaction:async ~ user",
      user
    );
    const body = req.body;
    const id = req.params.id;

    try {
      const schema = Joi.object({
        limit_id: Joi.number(),
        safe_id: Joi.number(),
        detailExpense: Joi.string(),
        expense: Joi.number(),
      });

      const { error } = schema.validate(
        {
          limit_id: body.limit_id,
          safe_id: body.safe_id,
          detailExpense: body.detailExpense,
          expense: body.expense,
        },
        { abortEarly: false }
      );

      if (error) {
        return res.status(400).json({
          status: "failed",
          message: "Bad Request",
          errors: error["details"][0]["message"],
        });
      }

      const updateTransaction = await Transactions.update(
        { ...body },
        { where: { id: id } }
      );

      if (!updateTransaction[0]) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to update transaction",
        });
      }

      const data = await Transactions.findOne({
        where: { id: id, user_id: user.id },
      });

      return res.status(200).json({
        status: "success",
        message: "Successfully retrieved data transactions",
        data: {
          data,
        },
      });
    } catch (error) {
      console.log(
        "🚀 ~ file: transactionsController.js ~ line 257 ~ updateTransaction:async ~ error",
        error
      );
      return res.status(500).json({
        status: "failed",
        message: "Internal server error",
      });
    }
  },

  deleteTransaction: async (req, res) => {
    const user = req.user;
    const id = req.params.id;

    try {
      const check = await Transactions.destroy({
        where: {
          user_id: user.id,
          id: id,
        },
      });

      if (!check) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to delete the data",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Internal server error",
      });
    }
  },
};
