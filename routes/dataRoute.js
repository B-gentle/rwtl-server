const express = require("express");
const dataPlan = require("../controllers/dataController");
const router = express.Router();

router.get("/plans", dataPlan)


module.exports = router;