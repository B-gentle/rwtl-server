const express = require("express");
const { purchaseAirtime, sendMoney, getTransactions } = require("../controllers/transactionController");
const {protect} = require("../middleWare/authMiddleware");
const router = express.Router();

router.post("/purchaseairtime", protect, purchaseAirtime);
router.patch("/sendmoney", protect, sendMoney);
router.get("/getTransactions", protect, getTransactions)

module.exports = router;