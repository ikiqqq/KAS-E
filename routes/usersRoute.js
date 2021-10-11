const express = require('express')
const router = express.Router()
const users = require('../controllers/usersController')
const auth = require('../middlewares/authentication')
const profilePicture = require('../middlewares/profilePicture')

router.post("/login", users.login)
router.post("/register", profilePicture("profilePicture"), users.register)
router.get("/verify", users.verifyEmail)
router.get("/:id", auth, users.getOneUser)
router.put("/data/:id", auth, profilePicture("profilePicture"), users.updateDataUsers)
router.delete("/delete/:id", auth, users.deleteUsers)

module.exports = router