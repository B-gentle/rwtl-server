const express = require("express");
const { addPackage, getPackages, getUpgradePackages } = require("../controllers/packageController");
const {protect} = require("../middleWare/authMiddleware");
const router = express.Router();

router.post("/addPackage", addPackage)
router.get("/packages", getPackages)
router.get("/upgradepackages", protect, getUpgradePackages)


module.exports = router;