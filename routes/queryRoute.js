const express = require("express");
const {resetmonthlypv, findTransactionsWithSameSenderAndRecipient, insertQuery, insertDataPlans} = require("../utilities/dbQueries")
const {protect} = require("../middleWare/authMiddleware");
const router = express.Router();

router.post("/resetmonthlypv", protect, resetmonthlypv);
router.post("/insertdata", protect, insertQuery);
router.post("/insertdataplans", protect, insertDataPlans);
router.get("/findsamesenderandreceiver", protect, findTransactionsWithSameSenderAndRecipient)


module.exports = router