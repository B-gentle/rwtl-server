const express = require("express");
const {getDataPlan, getCablePlans, getJoeNadPlan, getDnaCablePlans, editDnaDataPrices} = require("../controllers/dataController");
const { protect, adminProtect, adminRoleProtect } = require("../middleWare/authMiddleware");
const router = express.Router();

router.post("/dataplans", getDataPlan)
router.post("/cablePlans", getCablePlans)
router.get("/dnaCable", protect, getDnaCablePlans)
router.post("/getjoenadplan", protect, getJoeNadPlan)
router.post("/admin-getjoenadplan", adminProtect, getJoeNadPlan)
router.put("/manage-data-prices/:networkId", adminProtect, adminRoleProtect(['Super']), editDnaDataPrices)


module.exports = router;