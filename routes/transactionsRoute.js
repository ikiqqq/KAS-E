const router = require('express').Router()
const transactions = require('../controllers/transactionsController')
const auth = require('../middlewares/authentication')

router.post('/', auth, transactions.postTransaction)
router.get('/', auth, transactions.getAllTransaction)
router.put('/:id', auth, transactions.updateTransaction)
router.delete('/:id', auth, transactions.deleteTransaction)

module.exports = router;