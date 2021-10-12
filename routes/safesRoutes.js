const express = require('express');
const router = express.Router();
const safesController = require("../controllers/safesController");

router.post("/create", safesController.createSafe);
router.get("/", safesController.getSafe);
router.patch("/:id", safesController.addIncome);
router.delete("/:id", safesController.deleteSafe);

module.exports = router;