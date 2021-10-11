const Joi = require("joi");
const { Categories } = require("../models");

module.exports = {
  postCategory: async (req, res) => {
    const body = req.body;
    try {
      const schema = Joi.object({
        categoryName: Joi.string().required(),
      });

      const { error } = schema.validate(
        { 
          categoryName: body.categoryName
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

      const check = await Categories.create({
        categoryName: body.categoryName
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
  getCategory: async (req, res) => {
    try {
      const category = await Categories.findAll();
      if (category.length==0) {
        return res.status(404).json({
          status: "failed",
          message: "Data not found",
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Successfully retrieved category data",
        data: category,
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
    try {
      const schema = Joi.object({
        category_id: Joi.number().required(),
        user_id: Joi.number().required(),
        limit: Joi.number().required(),
      });

      const { error } = schema.validate(
        {
          category_id: body.category_id,
          user_id: body.user_id,
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
            id: req.params.id,
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
          id: req.params.id,
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
    try {
      const check = await Limits.destroy({
        where: {
          id, // id : id
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
