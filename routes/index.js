const express = require('express');
const router = express.Router();
const limit = require('./limitsRoute')
const category = require('./categoriesRoute')
const user = require('./usersRoute')
const profile = require('./profilesRoute')
const transaction = require('./transactionsRoute')
const safeRoute = require("./safesRoutes");

router.use('/limit', limit)
router.use('/category', category)
router.use('/user', user)
router.use('/profile', profile)
router.use('/transaction', transaction)
router.use("/safe", safeRoute);

module.exports = router;
