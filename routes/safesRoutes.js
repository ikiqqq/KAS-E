const express = require('express');
const router = express.Router();
const safesController = require("../controllers/safesController");
const auth = require('../middlewares/authentication')
const check = require('../middlewares/checkSafes')

router.post("/create", auth, check, safesController.createSafe);
router.get("/", auth, safesController.getSafe);
router.post("/income", auth, safesController.addIncomeAmount);
router.put("/", auth, safesController.updateSafe);
router.delete("/:id", auth, safesController.deleteSafe);

module.exports = router;