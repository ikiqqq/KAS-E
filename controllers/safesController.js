const { Safes, Users } = require("../models");
const Joi = require("joi");

module.exports = {
  createSafe: async (req, res) => {
    const user = req.user;
    const body = req.body;
    try {
      const schema = Joi.object({
        user_id: Joi.number().required(),
        safeName: Joi.string().min(4).required(),
        amount: Joi.number().required(),
      });
      const check = schema.validate(
        {
          user_id: user.id,
          safeName: body.safeName,
          amount: body.amount,
        },
        { abortEarly: false }
      );

      if (check.error) {
        return res.status(400).json({
          status: "failed",
          message: "Bad Request",
          errors: check.error["details"][0]["message"],
        });
      }

      const safe = await Safes.create({
        user_id: user.id,
        safeName: body.safeName,
        amount: body.amount,
      });
      if (safe) {
        return res.status(200).json({
          success: true,
          message: "Successfully created safe",
        });
      } else {
        return res.status(401).json({
          message: "Failed to create user safe",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "failed",
        message: error.message || "Internal Server Error",
      });
    }
  },
  getSafe: async (req, res) => {
    const user = req.user;
    try {
      const safe = await Safes.findAll({
        where: {
          user_id: user.id,
        },
        include: [
          {
            model: Users,
            as: "user",
            attributes: {
              exclude: ["password", "confirmPassword", "verifCode"],
            },
          },
        ],
      });

      if (!safe.length) {
        return res.status(400).json({
          status: "failed",
          message: "There's no safe in database!",
        });
      } else {
        console.log(safe);
        return res.status(200).json({
          success: { message: "This is the list of safes" },
          data: safe,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "failed",
        message: error.message || "Internal Server Error",
      });
    }
  },
  addIncomeAmount: async (req, res) => {
    const user = req.user;
    const body = req.body;
    try {
      const schema = Joi.object({
        user_id: Joi.number().required(),
        amount: Joi.number().required(),
      });
      const check = schema.validate(
        {
          user_id: user.id,
          amount: body.amount,
        },
        { abortEarly: false }
      );

      if (check.error) {
        return res.status(400).json({
          status: "failed",
          message: "Bad Request",
          errors: check.error["details"][0]["message"],
        });
      }

      const oldIncome = await Safes.findOne({
        where: {
          user_id: user.id,
        },
      });

      if (oldIncome.length == 0) {
        return res.status(400).json({
          status: "failed",
          message: "can not found user_id",
        });
      }

      const additional = body.amount;

      const newIncome = await Safes.update(
        {
          amount: oldIncome.amount + additional,
        },
        {
          where: { id: oldIncome.id },
        }
      );

      if (newIncome) {
        return res.status(200).json({
          success: true,
          message: "Successfully add income",
        });
      } else {
        return res.status(401).json({
          message: "Failed to add income",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "failed",
        message: error.message || "Internal Server Error",
      });
    }
  },
  updateSafe: async (req, res) => {
    const user = req.user;
    const body = req.body;
    try {
      const schema = Joi.object({
        user_id: Joi.number(),
        safeName: Joi.string(),
        amount: Joi.number(),
      });

      const { error } = schema.validate(
        {
          user_id: user.id,
          safeName: body.safeName,
          amount: body.amount,
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

      const updateSafe = await Safes.update(
        { ...body },
        { where: { user_id: user.id } }
      );

      if (!updateSafe[0]) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to update safe",
        });
      }

      const data = await Safes.findOne({
        where: { user_id: user.id },
      });

      return res.status(200).json({
        status: "success",
        message: "Successfully retrieved data safe",
        data: {
          data,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Internal server error",
      });
    }
  },
  deleteSafe: async (req, res) => {
    const user = req.user;
    try {
      const deletedSafe = await Safes.destroy({
        where: {
          id: req.params.id,
          user_id : user.id
        },
      });

      if (!deletedSafe) {
        return res.status(400).json({
          status: "failed",
          message: "Failed to delete!",
        });
      } else {
        return res.status(200).json({
          status: "success",
          message: "Successfully delete safe!",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "failed",
        message: error.message || "Internal Server Error",
      });
    }
  },
};
