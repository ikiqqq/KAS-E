const express = require('express')
const router = express.Router()
const users = require('../controllers/usersController')

router.post("/login", users.login)
router.post("/register", users.register)
router.get("/verify", users.verifyEmail)
router.post('/forgot', users.forgotPassword)
router.put('/reset-password/:id/:token', users.resetPassword)


module.exports = router