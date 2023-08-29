const express = require("express");
const { fundWallet } = require("../controllers/transactionController");
const {
    registerUser,
    loginUser,
    logout,
    getLoggedInUser,
    loginStatus,
    updateUser,
    changePassword,
    resetPassword,
    forgotPassword,
    checks,
    addDownline,
    deleteUser,
    upgradePackage,
    getUserIncentives,
    getNotification,
    getUserFullName,
    generateStaticAccount,
    createTransactionPin,
    changePin
} = require("../controllers/userController");
const {
    protect
} = require("../middleWare/authMiddleware");
const User = require("../models/userModel");
const router = express.Router();

router.post("/detailsValid", checks);
router.post("/register", registerUser);
router.post("/adddownline", protect, addDownline);
router.post("/login", loginUser);
router.post("/forgotpassword", forgotPassword)
router.post("/get-full-name", protect, getUserFullName)
router.post("/generate-static-account", protect, generateStaticAccount)
router.post("/fund-wallet", fundWallet)
router.put("/resetpassword/:restToken", resetPassword)
router.get("/logout", logout)
router.get("/loginstatus", loginStatus)
router.get("/getuser", protect, getLoggedInUser)
router.patch("/updateuser", protect, updateUser)
router.patch("/upgradepackage", protect, upgradePackage)
router.patch("/changepassword", protect, changePassword)
router.patch("/create-pin", protect, createTransactionPin)
router.patch("/change-pin", protect, changePin)
router.post("/deleteuser", deleteUser)
router.get("/getuserincentive", protect, getUserIncentives)
router.get("/get-notifications", protect, getNotification)


module.exports = router;