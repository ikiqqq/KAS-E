const Joi = require("joi");
const { Limits } = require("../models");
const { Categories } = require("../models");
const jwt = require("../helpers/jwt");
const {getUserData} = require("../helpers/jwt")

module.exports = {
  postLimit: async (req, res) => {
    const body = req.body;
    const token = req.header("Authorization").replace("Bearer ", "")
    const user = jwt.getUserData(token)
    try {
      const schema = Joi.object({
        category_id: Joi.number().required(),
        limit: Joi.number().required(),
      });

      const { error } = schema.validate(
        {
          category_id: body.category_id,
          limit: body.limit,
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
      // const isExist=await Limits.findOne({
      //   where:{
      //     user_id: user.id
      //     // category_id: body.category_id
      //   }
      // })
      // if(!isExist){
      //   return res.status(400).json({
      //     status: "failed",
      //     message: "User not found",
      //   });
      // }
      const check = await Limits.create({
        category_id: body.category_id,
        user_id: user.id,
        limit: body.limit,
      });

      if (!check) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to save the data to database",
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Successfully saved to database",
        data: check,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
      });
    }
  },
  getAllLimit: async (req, res) => {
    const user = req.user
    try {
      const limit = await Limits.findAll({
        where:{
          user_id: user.id
        },
        include: [
          {
            model: Categories,
            as: "Category",
          },
        ],
      });
      if (limit.length == 0) {
        return res.status(404).json({
          status: "failed",
          message: "Data not found",
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Successfully retrieved limit data",
        data: limit,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
      });
    }
  },
  getLimit: async (req, res) => {
    try {
      const token = req.header("Authorization").replace("Bearer ", "")
      const user = jwt.getUserData(token)
      const limit = await Limits.findAll({
        where: {
          user_id: user.id,
        },
        // include: [
        //   {
        //     model: Categories,
        //     as: "Category",
        //   },
        // ],
      });
      if (limit.length == 0) {
        return res.status(404).json({
          status: "failed",
          message: "Data not found",
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Successfully retrieved limit data",
        data: limit,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
      });
    }
  },
  updateLimit: async (req, res) => {
    const body = req.body;
    const userData = getUserData(req.headers.token);
    const userId = userData.id;
    try {
      const schema = Joi.object({
        category_id: Joi.number(),
        limit: Joi.number(),
      });

      const { error } = schema.validate(
        {
          category_id: body.category_id,
          limit: body.limit,
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

      const updatedLimit = await Limits.update(
        { ...body },
        {
          where: {
            user_id: userId,
          },
        }
      );

      if (!updatedLimit[0]) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to update database",
        });
      }

      const data = await Limits.findOne({
        where: {
          user_id: userId,
        },
      });

      return res.status(200).json({
        status: "success",
        message: "Data updated successfully",
        data: data,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
      });
    }
  },
  deleteLimit: async (req, res) => {
    const id = req.params.id;
    const userData = getUserData(req.headers.token);
    const userId = userData.id;
    try {
      const check = await Limits.destroy({
        where: {
          category_id: id,
          user_id: userId
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
        message: "Internal Server Error",
      });
    }
  },
};
