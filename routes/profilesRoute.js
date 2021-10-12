const express = require('express')
const router = express.Router()
const profiles = require('../controllers/profilesController')
const auth = require('../middlewares/authentication')
const upload = require('../middlewares/profilePicture')

router.get("/", auth, profiles.getUserLogin)
router.put('/edit', auth, upload('profilePicture'), profiles.updateProfile)

module.exports = router