const express = require('express');
const router = express.Router();
const limit = require('./limitsRoute')
const category = require('./categoriesRoute')
const user = require('./usersRoute')
const profile = require('./profilesRoute')
const transaction = require('./transactionsRoute')

router.use('/limit', limit)
router.use('/category', category)
router.use('/user', user)
router.use('/profile', profile)
router.use('/transaction', transaction)

module.exports = router;