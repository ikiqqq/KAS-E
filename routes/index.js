const express = require('express');
const router = express.Router();
const safeRoute = require("./safesRoutes");

router.use("/safe", safeRoute);


module.exports = router;