const { Users, Profiles } = require('../models')
require('dotenv').config();
const Joi = require('joi')
const jwt = require("../helpers/jwt")
const { Op } = require("sequelize");
const { encrypt, checkPass } = require("../helpers/bcrypt")
const { v4: uuidv4 } = require('uuid')
const nodemailer = require("nodemailer");

module.exports = {
    register: async(req, res) => {
        const body = req.body
        try {
            const schema = Joi.object({
                email: Joi.string().required(),
                password: Joi.string().min(6).max(12).required(),
                confirmPassword: Joi.string().min(6).max(12).required(),
                fullName: Joi.string().required(),
                gender: Joi.string().required(),
                age: Joi.number().required(),
                profilePicture: Joi.string()
            })

            const check = schema.validate({
                email: body.email,
                password: body.password,
                confirmPassword: body.password,
                fullName: body.fullName,
                gender: body.gender,
                age: body.age,
                profilePicture: req.file ? req.file.path : "profilePicture"
            }, { abortEarly: false });

            if (check.error) {
                return res.status(400).json({
                    status: "failed",
                    message: "Bad Request",
                    errors: check.error["details"].map(({ message }) => message)
                })
            }
            const checkEmail = await Users.findOne({
                where: {
                    email: body.email
                }
            })

            if (checkEmail) {
                return res.status(400).json({
                    status: "failed",
                    message: "Email already used, please use another email, or login",
                });
            }

            if (body.password !== body.confirmPassword) {
                return res.status(400).json({
                    status: "failed",
                    message: "Password Does Not Match.",
                });
            }

            const user = await Users.create({
                email: body.email,
                password: encrypt(body.password),
                confirmPassword: encrypt(body.password),
                verifCode: uuidv4()
            })

            const profile = await Profiles.create({
                user_id: user.id,
                fullName: body.fullName,
                gender: body.gender,
                age: body.age,
                [req.file ? "profilePicture" : null]: req.file ? req.file.path : null
            })

            let transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "tesfadhlan@gmail.com",
                    pass: "secret123!@#",
                },
            });

            let url = `localhost:5050/api/v1/users/verify?email=${user.email}&verifCode=${user.verifCode}`

            let info = await transporter.sendMail({
                from: `tesfadhlan@gmail.com`,
                to: `${user.email}`,
                subject: "[Kas-E] Account Verification",
                html: `
                <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
                <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to Kas-E.</h2>
                <p>Please verify your email.
                    Just click the button below to verify your email address.
                </p>
                
                <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">Verify E-mail</a>
            
                <p>If the button doesn't work for any reason, you can also click on the link below:</p>
            
                <a href="${url}">${url}</a>
                </div>
                `
            });

            console.log("Message sent: %s", info.messageId);

            return res.status(200).json({
                status: "success",
                message: "Registered successfully, please check your email",
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: "failed",
                message: "Internal Server Error",
            });
        }
    },

    verifyEmail: async(req, res) => {
        const { email, verifCode } = req.query

        try {
            let user = await Users.findOne({ where: { email: email } });
            if (!user) {
                return res.status(400).json({
                    status: 'failed',
                    message: 'E-mail not found'
                });
            }

            if (verifCode !== user.verifCode) {
                return res.status(400).json({
                    status: 'failed',
                    message: 'Verification code is not valid'
                });
            }

            if (user.isVerified === true) {
                return res.status(400).json({
                    status: 'failed',
                    message: 'Account already verified'
                });
            }

            user = await Users.update({
                isVerified: true
            }, {
                where: {
                    email: email
                }
            });
            res.status(200).json({
                status: 'success',
                message: 'Verification account success'
            })

            return res.redirect('/users/login')
        } catch (error) {
            return res.status(500).json({
                status: 'failed',
                message: 'Internal server error'
            })
        }
    },

    login: async(req, res) => {
        const body = req.body
        try {
            const schema = Joi.object({
                email: Joi.string().required(),
                password: Joi.string().min(6).max(12).required()
            })

            const {error} = schema.validate({...body });

            if (error) {
                return res.status(400).json({
                    status: "failed",
                    message: "Bad Request",
                    errors: error.message
                })
            }

            const user = await Users.findOne({
                where: {
                    email: body.email
                }
            })

            if (!user) {
                return res.status(400).json({
                    status: "failed",
                    message: "Invalid email",
                });
            }

            const checkPassword = checkPass(body.password, user.dataValues.password)

            if (!checkPassword) {
                return res.status(401).json({
                    status: "failed",
                    message: "Invalid Password"
                })
            }

            if (user.dataValues.isVerified === false) {
                return res.status(400).json({
                    status: 'failed',
                    message: 'Please verify your email first'
                })
            }

            const payload = {
                email: user.dataValues.email,
                id: user.dataValues.id
            }
            const token = jwt.generateToken(payload)

            return res.status(200).json({
                status: "success",
                message: "Login successfully",
                token: token,
            });

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                status: "failed",
                message: error.message || "Internal Server Error",
            });
        }
    }
}