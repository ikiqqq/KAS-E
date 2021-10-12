const { Safes } = require("../models");
const Joi = require("joi");
const { getUserData } = require("../helpers/jwt");
class safesController {
    static async createSafe(req, res) {
        const body = req.body;
        try {
          const userData = getUserData(req.headers.token);
          const userId = userData.id
          const schema = Joi.object({
            safeName: Joi.string().min(4).required(),
            amount: Joi.string().required()
          });
          const check = schema.validate({
            user_id: userId,
            safeName: body.safeName,
            amount: body.amount
          }, 
          { abortEarly: false });

          if (check.error) {
            return res.status(400).json({
              status: "failed",
              message: "Bad Request",
              errors: check.error["details"][0]["message"],
            });
          }
        
          const safe = await Safes.create({
            safeName: body.safeName,
            amount: body.amount
          });
          if (safe) {
            return res.status(200).json({
              success: true,
              message: "Successfully created safe"
            });
          } else {
            return res.status(401).json({ 
              message: "Failed to create user safe" 
            });
          }
        } catch (error) {
          console.log(error);
          return res.status(500).json({
            status: "failed",
            message: error.message || "Internal Server Error",
          });
        }
      }

  static async getSafe(req, res) {
    try {
      const safe = await Safes.findAll();
      if (!safe.length) {
        return res.status(400).json({
          status: "failed",
          message: "There's no safe in database!",
        });
      } else {
        return res
          .status(200)
          .json({
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
  }

  static async addIncome(req, res) {
    try {
      const id = req.params.id
      const updateSafe = await Safes.update(
        {
          safeName: req.body.safeName,
          amount: req.body.amount,
        },
        { where: { id } }
      );

      if (!updateSafe) {
        return res.status(400).json({
          status: "failed",
          message: "Failed to update!",
        });
        
      } else {
        return res.status(200).json({ 
          status: "success", 
          message: "Update success"
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "failed",
        message: error.message || "Internal Server Error",
      });
    }
  }

  static async deleteSafe(req, res) {
    try {
      const deletedSafe = await Safes.destroy({
        where: {
          id: req.params.id,
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
  }
}

module.exports = safesController;