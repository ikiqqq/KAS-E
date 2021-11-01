const { Profiles, Users } = require("../models");
const Joi = require("joi");
const { checkPass, encrypt } = require("../helpers/bcrypt");
// const path = require("path");
// const { profile } = require("console");

module.exports = {
  getUserLogin: async (req, res) => {
    const user = req.user;

    try {
      const usersData = await Profiles.findOne({
        where: { user_id: user.id },
        attributes: { exclude: ["createdAt", "updatedAt"] },
        include: {
          model: Users,
          attributes: ["id", "email"],
        },
      });

      if (!usersData) {
        return res.status(400).json({
          status: "failed",
          message: "Data not found",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Succesfully retrieved data User",
        data: usersData,
      });
    } catch (error) {
      console.log(
        "🚀 ~ file: profilesController.js ~ line 33 ~ getUserLogin:async ~ error",
        error
      );
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
      });
    }
  },
  updateProfile: async (req, res) => {
    const body = req.body;
    const user = req.user;
    console.log(user.id)
    try {
      const schema = Joi.object({
        user_id: Joi.number(),
        fullName: Joi.string(),
        email: Joi.string(),
        gender: Joi.string(),
        age: Joi.number(),
        password: Joi.string(),
        profilePicture: Joi.string(),
      });

      const { error } = schema.validate(
        {
          user_id: user.id,
          fullName: body.fullName,
          email: body.email,
          gender: body.gender,
          age: body.age,
          password: body.password,
          profilePicture: req.file ? req.file.path : "profilePicture",
        },
        { abortEarly: false }
      );

      if (error) {
        return res.status(400).json({
          status: "failed",
          message: "Bad Request",
          errors: error["details"].map(({ message }) => message),
        });
      }

      if (body.password) {
        const oldPass = await Users.findOne({
          where: {
            id: user.id,
          },
        });

        const checkPassword = checkPass(
          body.password,
          oldPass.dataValues.password
        );

        if (checkPassword) {
          return res.status(400).json({
            status: "fail",
            message: "Password already used before, please use new password",
          });
        }

        const hashedPassword = encrypt(body.password);

        await Users.update(
          { password: hashedPassword },
          { where: { id: user.id } }
        );
      }

      const userUpdate = await Users.update(
        {
          email: body.email,
          password: body.password,
        },
        {
          where: { id: user.id },
        }
      );
      if (!userUpdate) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to input data",
        });
      }

      const profileUpdate = await Profiles.update(
        {
          fullName: body.fullName,
          gender: body.gender,
          age: body.age,
          [req.file ? "profilePicture" : null]: req.file ? req.file.path : null,
        },
        { 
          where: 
          { 
            user_id: user.id 
          },
        }
      );
      console.log(profileUpdate)

      if (!profileUpdate) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to input data",
        });
      }

      const data = await Profiles.findOne({
        where: { user_id: user.id },
        // include: {
        //   model: Users,
        //   attributes: ["id", "email"],
        // },
      });

      return res.status(200).json({
        status: "success",
        message: "Succesfully update the data",
        data: data,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
      });
    }
  },
  deleteUsers: async (req, res) => {
    const id = req.params.id;
    try {
      const UsersData = await Profiles.destroy({ where: { id } });
      if (!UsersData) {
        return res.status(400).json({
          status: "failed",
          message: "Data not found",
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
