const express = require("express");
const {getDataPlan, getCablePlans} = require("../controllers/dataController");
const router = express.Router();

router.post("/dataplans", getDataPlan)
router.post("/cablePlans", getCablePlans)


module.exports = router;