const express = require('express');
const router = express.Router();
const limit = require('./limitsRoute')
const category= require('./categoriesRoute')

router.use('/limit', limit)
router.use('/category', category)


const usersRouter = require('./usersRoute')
const profilesRouter = require('./profilesRoute')

router.use('/users', usersRouter)
router.use('/profiles', profilesRouter)

module.exports = router;