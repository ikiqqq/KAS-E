const express = require('express');
const router = express.Router();
const limit = require('./limitsRoute')
const category= require('./categoriesRoute')

router.use('/limit', limit)
router.use('/category', category)


module.exports = router;