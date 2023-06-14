const express = require("express");
const { addPackage, getPackages } = require("../controllers/packageController");
const router = express.Router();

router.post("/addPackage", addPackage)
router.get("/packages", getPackages)


module.exports = router;