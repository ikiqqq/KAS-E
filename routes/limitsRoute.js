const express = require('express')
const router = express.Router()
const limit = require('../controllers/limitsController')

router.post("/", limit.postLimit )
router.get("/", limit.getAllLimit)
router.get('/:id', limit.getLimit)
router.put("/:id", limit.updateLimit)
router.delete("/:id", limit.deleteLimit)

module.exports = router