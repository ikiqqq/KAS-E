const express = require('express')
const router = express.Router()
const limit = require('../controllers/limitsController')
const auth = require('../middlewares/authentication')

router.post("/", auth, limit.postLimit )
router.get("/wholelimit", limit.getAllLimit)
router.get('/', limit.getLimit)
router.put("/:id", limit.updateLimit)
router.delete("/:id", limit.deleteLimit)

module.exports = router