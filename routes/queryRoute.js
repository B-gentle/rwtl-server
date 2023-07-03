const express = require("express");
const {resetmonthlypv, findTransactionsWithSameSenderAndRecipient, insertQuery} = require("../utilities/dbQueries")
const router = express.Router();

router.post("/resetmonthlypv", resetmonthlypv);
router.post("/insertdata", insertQuery);
router.get("/findsamesenderandreceiver", findTransactionsWithSameSenderAndRecipient)


module.exports = router