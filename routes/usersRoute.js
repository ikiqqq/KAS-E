const express = require('express')
const router = express.Router()
const users = require('../controllers/usersController')

router.post("/login", users.login)
router.post("/register", users.register)
router.get("/verify", users.verifyEmail)

module.exports = router