const express = require("express");
const {getDataPlan, getCablePlans, getJoeNadMtnPlan} = require("../controllers/dataController");
const { protect } = require("../middleWare/authMiddleware");
const router = express.Router();

router.post("/dataplans", getDataPlan)
router.post("/cablePlans", getCablePlans)
router.get("/getjoenadmtnplan", protect, getJoeNadMtnPlan)


module.exports = router;