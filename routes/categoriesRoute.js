const express = require('express')
const router = express.Router()
const categories = require('../controllers/categoriesController')

router.post("/", categories.postCategory )
// router.get("/", limit.getAllLimit)
// router.put("/:id", limit.updateLimit)
// router.delete("/:id", limit.deleteLimit)

module.exports = router