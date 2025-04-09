const express = require("express");
const {getDataPlan, getCablePlans, getJoeNadPlan, getDnaCablePlans, editDnaDataPrices, addDnaDataPrices, getJoeNadCablePlan, editDnaCablePrices, deleteDnaDataPlan, deleteDnaCablePlan, addDnaCablePlan} = require("../controllers/dataController");
const { protect, adminProtect, adminRoleProtect } = require("../middleWare/authMiddleware");
const router = express.Router();

router.post("/dataplans", getDataPlan)
router.post("/cablePlans", getCablePlans)
router.get("/dnaCable", protect, getDnaCablePlans)
router.post("/getjoenadplan", protect, getJoeNadPlan)
router.post("/admin-getjoenadplan", adminProtect, getJoeNadPlan)
router.put("/manage-data-prices/:networkId", adminProtect, adminRoleProtect(['Super']), editDnaDataPrices)
router.put("/add-data-plan", adminProtect, adminRoleProtect(['Super']), addDnaDataPrices)
router.post("/admin-getjoenadcableplan", adminProtect, getJoeNadCablePlan)
router.put("/manage-cable-prices/:id", adminProtect, adminRoleProtect(['Super']), editDnaCablePrices)
router.delete("/dataplan", adminProtect, adminRoleProtect(['Super']), deleteDnaDataPlan)
router.delete("/cableplan", adminProtect, adminRoleProtect(['Super']), deleteDnaCablePlan)
router.post("/add-cable-plan", adminProtect, adminRoleProtect(['Super']), addDnaCablePlan)


module.exports = router;