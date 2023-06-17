const express = require("express");
const dataPlan = require("../controllers/dataController");
const router = express.Router();

router.post("/plans", dataPlan)


module.exports = router;