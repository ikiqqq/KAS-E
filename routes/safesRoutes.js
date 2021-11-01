const express = require('express');
const router = express.Router();
const safesController = require("../controllers/safesController");
const auth = require('../middlewares/authentication')
const check= require('../middlewares/checkSafes')

router.post("/create", auth, safesController.createSafe);
router.get("/", auth, check, safesController.getSafe);
router.put("/", auth, safesController.updateSafe);
router.delete("/:id", auth, safesController.deleteSafe);

module.exports = router;