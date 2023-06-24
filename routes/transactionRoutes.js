const express = require("express");
const { purchaseAirtime, sendMoney, getTransactions, purchaseData, cableBills, electricityBills, transferCommission } = require("../controllers/transactionController");
const {protect} = require("../middleWare/authMiddleware");
const router = express.Router();

router.post("/purchaseairtime", protect, purchaseAirtime);
router.post("/purchasedata", protect, purchaseData);
router.post("/subscribedish", protect, cableBills);
router.post("/transfercomm", protect, transferCommission);
router.post("/electricity", protect, electricityBills);
router.patch("/sendmoney", protect, sendMoney);
router.get("/get-transactions", protect, getTransactions)

module.exports = router;