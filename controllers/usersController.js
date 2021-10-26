const { Users, Profiles } = require("../models");
require("dotenv").config();
const Joi = require("joi");
const jwt = require("../helpers/jwt");
const { Op } = require("sequelize");
const { encrypt, checkPass } = require("../helpers/bcrypt");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const path = require("path");


module.exports = {
    register: async(req, res) => {
        const body = req.body;
        try {
            const schema = Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().min(6).max(12).required(),
                confirmPassword: Joi.string().min(6).max(12).required(),
                fullName: Joi.string().required(),
                gender: Joi.string().required(),
                age: Joi.number().required(),
                profilePicture: Joi.string(),
            });

            const check = schema.validate({
                email: body.email,
                password: body.password,
                confirmPassword: body.confirmPassword,
                fullName: body.fullName,
                gender: body.gender,
                age: body.age,
                profilePicture: req.file ? req.file.path : "profilePicture",
            }, { abortEarly: false });

            if (check.error) {
                return res.status(400).json({
                    status: "failed",
                    message: "Bad Request",
                    errors: check.error["details"].map(({ message }) => message),
                });
            }
            const checkEmail = await Users.findOne({
                where: {
                    email: body.email,
                },
            });

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
                verifCode: uuidv4(),
            });

            const profile = await Profiles.create({
                user_id: user.id,
                fullName: body.fullName,
                gender: body.gender,
                age: body.age,
                [req.file ? "profilePicture" : null]: req.file ? req.file.path : null,
            });

            let transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "tesfadhlan@gmail.com",
                    pass: "secret123!@#",
                },
            });
            const handlebarOptions = {
                viewEngine: {
                    partialsDir: path.resolve("./views/"),
                    defaultLayout: false,
                },
                viewPath: path.resolve("./views/"),
            };
            transporter.use("compile", hbs(handlebarOptions));
            let mailOptions = {
                from: `tesfadhlan@gmail.com`,
                to: `${user.email}`,
                subject: "[Kas-E] Account Verification",
                template: "email",
                // attachments: [
                //   { filename: "pic.jpeg",
                //   path: "./attachments/pic.jpeg" },
                // ],
                context: {
                    url: `http://kas-e.herokuapp.com/api/v1/user/verify?email=${user.email}&verifCode=${user.verifCode}`,
                },
            };
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    return console.log(error);
                }
                console.log("Message sent: " + info.response);
            });

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
        const { email, verifCode } = req.query;

        try {
            let user = await Users.findOne({ where: { email: email } });
            if (!user) {
                return res.status(400).json({
                    status: "failed",
                    message: "E-mail not found",
                });
            }

            if (verifCode !== user.verifCode) {
                return res.status(400).json({
                    status: "failed",
                    message: "Verification code is not valid",
                });
            }

            if (user.isVerified === true) {
                return res.status(400).json({
                    status: "failed",
                    message: "Account already verified",
                });
            }

            const verify = await Users.update({
                isVerified: true,
            }, {
                where: {
                    email: email,
                },
            });
            res.status(200).json({
                status: "success",
                message: "Verification account success",
                data: verify,
            });

            return res.redirect("/user/login");
        } catch (error) {
            return res.status(500).json({
                status: "failed",
                message: "Internal server error",
            });
        }
  },
  login: async (req, res) => {
    const body = req.body;
    try {
      const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().min(6).max(12).required(),
      });

      const check = schema.validate({ ...body }, { abortEarly: false });

      if (check.error) {
        return res.status(400).json({
          status: "failed",
          message: "Bad Request",
          errors: check.error["details"].map(({ message }) => message),
        });
      }

      const user = await Users.findOne({
        where: {
          email: body.email,
        },
      });

      if (!user) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid email",
        });
      }

      const checkPassword = checkPass(body.password, user.dataValues.password);

      if (!checkPassword) {
        return res.status(401).json({
          status: "failed",
          message: "Invalid Password",
        });
      }

      if (user.dataValues.isVerified === false) {
        return res.status(400).json({
          status: "failed",
          message: "Please verify your email first",
        });
      }

      const payload = {
        email: user.dataValues.email,
        id: user.dataValues.id,
      };
      const token = jwt.generateToken(payload);

      return res.status(200).json({
        status: "success",
        message: "Login successfully",
        token: token,
      });
    } catch (error) {
      console.log(
        "🚀 ~ file: usersController.js ~ line 243 ~ login:async ~ error",
        error
      );
      return res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
      });
    }
  },
  forgotPassword: async (req, res) => {
    const body = req.body;
    try {
      const user = await Users.findOne({
        where: {
          email: body.email,
        },
      });
      // console.log(user);
      if (!user)
        return res.status(400).json({ msg: "This email does not exist." });

      const secret = process.env.SECRET + user.password;
      const payload = {
        email: user.dataValues.email,
        id: user.dataValues.id,
      };
      // console.log(payload);
      const token = jwt.generateToken(payload, secret);
      let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "tesfadhlan@gmail.com",
          pass: "secret123!@#",
        },
      });
      const handlebarOptions = {
        viewEngine: {
          partialsDir: path.resolve("./views/"),
          defaultLayout: false,
        },
        viewPath: path.resolve("./views/"),
      };
      transporter.use("compile", hbs(handlebarOptions));
      let mailOptions = {
        from: `tesfadhlan@gmail.com`,
        to: `${user.email}`,
        subject: "[Kas-E] Your Forgotton Password",
        template: "reset",
        context: {
          url: `http://kas-e.herokuapp.com/api/v1/user/reset-password/${user.id}/${token}`,
        },
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          return console.log(error);
        }
    },

    google: async(req, res) => {
        let payload;
        try {
            const checkEmail = await Users.findOne({
                where: {
                    email: req.user._json.email,
                },
            });
            if (checkEmail) {
                payload = {
                    email: checkEmail.email,
                    id: checkEmail.id,
                };
            } else {
                const user = await Users.create({
                    email: req.user._json.email,
                    password: "",
                    confirmPassword: ""
                });
                payload = {
                    email: user.email,
                    id: user.id,
                };
            }
            const token = jwt.generateToken(payload)
            return res.redirect('http://localhost:5050/api/v1/user/login?token=' + token);
        } catch (error) {
            console.log(error),
                res.sendStatus(500)
        }
      );

      if (!updatePassword) {
        return res.status(400).json({
          status: "failed",
          message: "Unable to input data",
        });
      }

      const data = await Users.findOne({
        where: {
          id: id,
        },
      });

      res.status(200).json({
        status: "success",
        message: "Password successfully changed!",
        data: data,
      });
      return res.redirect("/user/login");
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  google: async (req, res) => {
    let payload;
    try {
      const checkEmail = await Users.findOne({
        where: {
          email: req.user._json.email,
        },
      });
      if (checkEmail) {
        payload = {
          email: checkEmail.email,
          id: checkEmail.id,
        };
      } else {
        const user = await Users.create({
          email: req.user._json.email,
          password: "",
          confirmPassword : ""
        });
        payload = {
          email: user.email,
          id: user.id,
        };
      }
      const token = jwt.generateToken (payload)
        return res.redirect('http://localhost:5050/api/v1/user/login?token='+ token);
    } catch (error) {
      console.log(error),
      res.sendStatus(500)
    }
  },

  facebook: async (req, res) => {
    let payload;
    try {
      const checkEmail = await Users.findOne({
        where: {
          email: req.user._json.email,
        },
      });
      if (checkEmail) {
        payload = {
          email: checkEmail.email,
          id: checkEmail.id,
        };
      } else {
        const user = await Users.create({
          email: req.user._json.email,
          password: "",
          confirmPassword : ""
        });
        payload = {
          email: user.email,
          id: user.id,
        };
      }

      const token = jwt.generateToken (payload)
        return  res.redirect('https://localhost:5050/api/v1/user/login?token='+ token);
    } catch (error) {
      console.log(error),
      res.sendStatus(500)
    }
  },

};