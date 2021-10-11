const express = require('express');
const router = express.Router();

const usersRouter = require('./usersRoute')
const profilesRouter = require('./profilesRoute')

router.use('/users', usersRouter)
router.use('/profiles', profilesRouter)

module.exports = router;