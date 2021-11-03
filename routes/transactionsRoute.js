const router = require('express').Router()
const transactions = require('../controllers/transactionsController')
const auth = require('../middlewares/authentication')
const check= require('../middlewares/checkSafes')
const multer = require('multer');
const form = multer()

router.post('/', form.any(), auth, check, transactions.postTransaction)
router.post('/addincome', form.any(),auth, transactions.postAddIncome)
router.get('/', auth, check, transactions.getAllTransaction)
router.put('/:id', auth, transactions.updateTransaction)
router.delete('/:id', auth, transactions.deleteTransaction)

module.exports = router;