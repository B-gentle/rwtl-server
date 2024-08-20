const express = require("express");
const {getDataPlan, getCablePlans, getJoeNadPlan, getDnaCablePlans} = require("../controllers/dataController");
const { protect } = require("../middleWare/authMiddleware");
const router = express.Router();

router.post("/dataplans", getDataPlan)
router.post("/cablePlans", getCablePlans)
router.get("/dnaCable", protect, getDnaCablePlans)
router.post("/getjoenadplan", protect, getJoeNadPlan)


module.exports = router;