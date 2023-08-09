const express = require("express");
const { addadmin, creditUserWallet, completeUserRegistration, loginAdmin, logout, getLoggedInAdmin, loginStatus, getPendingRegisteredUsers, viewUserDetails, viewUserTransactions, editUserPersonalInformation, editUserBankDetails, changeUserPassword, accessUserAccount, notifyUsers, editUsername, viewQualifiedUsers, changePassword } = require("../controllers/adminController");
const { getTransactions } = require("../controllers/transactionController");
const { resetPassword, forgotPassword, getUserFullName } = require("../controllers/userController");
const {adminProtect, protect} = require("../middleWare/authMiddleware");
const router = express.Router();

router.post("/addadmin", addadmin);
router.patch("/credit", adminProtect, creditUserWallet);
router.post("/login", loginAdmin);
router.post("/get-full-name", adminProtect, getUserFullName)
router.post("/edit-user-username", adminProtect, editUsername)
router.patch("/completeRegistration", adminProtect, completeUserRegistration)
router.post("/forgotpassword", forgotPassword)
router.put("/resetpassword/:restToken", resetPassword)
router.get("/logout", logout)
router.get("/loginstatus", loginStatus)
router.get("/getadmin", adminProtect, getLoggedInAdmin)
router.get("/getpendingregistrations", adminProtect, getPendingRegisteredUsers)
router.get("/view-qualified-users", adminProtect, viewQualifiedUsers)
router.post("/viewuser", adminProtect, viewUserDetails)
router.post("/viewusertransactions", adminProtect, viewUserTransactions)
router.post("/edituserpi", adminProtect, editUserPersonalInformation)
router.post("/edituserbank", adminProtect, editUserBankDetails)
router.post("/edituserpassword", adminProtect, changeUserPassword)
router.post("/enteruseraccount", adminProtect, accessUserAccount)
router.post("/notifyusers", adminProtect, notifyUsers)
router.patch("/changepassword", adminProtect, changePassword)


module.exports = router;