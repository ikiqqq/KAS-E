const { Profiles, Users } = require('../models')
const Joi = require('joi');

module.exports = {
    getUserLogin: async(req, res) => {
        const user = req.user
        console.log("🚀 ~ file: profilesController.js ~ line 10 ~ getUserLogin:async ~ user", user)
        try {
            const usersData = await Profiles.findOne({
                where: { user_id: user.id },
                attributes: { exclude: ['createdAt', 'updatedAt'] },
                include: {
                    model: Users,
                    attributes: ['id', 'email']
                }
            });

            if (!usersData) {
                return res.status(400).json({
                    status: "failed",
                    message: "Data not found"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Succesfully retrieved data User",
                data: usersData
            });
        } catch (error) {
            console.log("🚀 ~ file: profilesController.js ~ line 33 ~ getUserLogin:async ~ error", error)
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
            })
        }
    },
    updateProfile: async(req, res) => {
        const body = req.body
        const user_id = req.users.id
        const id = req.params.id
        try {
            const schema = Joi.object({
                user_id: Joi.number(),
                fullName: Joi.string(),
                gender: Joi.boolean(),
                age: Joi.number(),
                profilePicture: Joi.string()
            })

            const { error } = schema.validate({
                user_id: user_id,
                fullName: body.fullName,
                gender: body.gender,
                age: body.age,
                profilePicture: req.file ? req.file.path : "profilePicture"
            }, { abortEarly: false });

            if (error) {
                return res.status(400).json({
                    status: "failed",
                    message: "Bad Request",
                    errors: error["details"].map(({ message }) => message)
                })
            }

            if (body.password) {
                const checkId = await Users.findOne({
                    where: {
                        id: req.params.id
                    }
                })

                const checkPassword = bcrypt.cekPass(body.password, checkId.dataValues.password)

                if (checkPassword) {
                    return res.status(400).json({
                        status: "fail",
                        message: "Password already used before, please use new password",
                    });
                }

                const hashedPassword = bcrypt.encrypt(body.password)

                await Users.update({ password: hashedPassword }, { where: { id } });
            }

            const userUpdate = await Users.update({
                fullName: body.fullName,
                gender: body.gender,
                age: body.age,
                [req.file ? "profilePicture" : null]: req.file ? req.file.path : null
            }, { where: { id } });

            if (!userUpdate) {
                return res.status(400).json({
                    status: "failed",
                    message: "Unable to input data"
                });
            }

            const data = await Users.findOne({
                where: { id }
            })

            return res.status(200).json({
                status: "success",
                message: "Succesfully update the data",
                data: data
            });
        } catch (error) {
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
            })
        }
    },

    deleteUsers: async(req, res) => {
        const id = req.params.id
        try {
            const UsersData = await Users.destroy({ where: { id } });
            if (!UsersData) {
                return res.status(400).json({
                    status: "failed",
                    message: "Data not found"
                });
            }
            return res.status(200).json({
                status: "success",
                message: "Deleted successfully",
            });
        } catch (error) {
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error"
            })
        }
    }
}