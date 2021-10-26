const express = require('express')
const router = express.Router()
const users = require('../controllers/usersController')
const passport = require("../middlewares/passport");

router.post("/login", users.login)
router.post("/register", users.register)
router.get("/verify", users.verifyEmail)
router.post('/forgot', users.forgotPassword)
router.put('/reset-password/:id/:token', users.resetPassword)
router.get("/login/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/failed", (req, res)=> res.send("anda gagal login, silahkan ulang lagi"))
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/api/v1/user/failed" }), users.google)



module.exports = router