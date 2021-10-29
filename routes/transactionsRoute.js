const router = require('express').Router()
const transactions = require('../controllers/transactionsController')
const auth = require('../middlewares/authentication')
const check= require('../middlewares/checkSafes')

router.post('/', auth,check, transactions.postTransaction)
router.post('/addincome', auth, transactions.postAddIncome)
router.get('/', auth, transactions.getAllTransaction)
router.put('/:id', auth, transactions.updateTransaction)
router.delete('/:id', auth, transactions.deleteTransaction)

module.exports = router;