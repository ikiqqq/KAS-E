const express = require('express')
const router = express.Router()
const profiles = require('../controllers/profilesController')
const auth = require('../middlewares/authentication')

router.get("/", auth, profiles.getUserLogin)
    // router.post("/register", users.register)
    // router.get("/verify", users.verifyEmail)

module.exports = router