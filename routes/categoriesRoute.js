const express = require('express')
const router = express.Router()
const categories = require('../controllers/categoriesController')
const upload = require('../middlewares/categoriesIcon')

router.post("/", categories.postCategory )
router.get("/", categories.getCategory)
router.put("/:id", upload('categoryIcon'), categories.updateCategory)
router.delete("/:id", categories.deleteCategory)

module.exports = router