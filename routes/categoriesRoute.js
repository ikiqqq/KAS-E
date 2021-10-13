const express = require('express')
const router = express.Router()
const categories = require('../controllers/categoriesController')

router.post("/", categories.postCategory )
router.get("/", categories.getCategory)
router.put("/:id", categories.updateCategory)
router.delete("/:id", categories.deleteCategory)

module.exports = router