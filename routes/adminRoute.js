const express = require("express");
const { addadmin, creditUserWallet, completeUserRegistration, loginAdmin, logout, getLoggedInAdmin, loginStatus, getPendingRegisteredUsers, viewUserDetails, viewUserTransactions, editUserPersonalInformation, editUserBankDetails, changeUserPassword, accessUserAccount, notifyUsers, editUsername, viewQualifiedUsers, changePassword, getTotalAdmin, viewAdmins, deleteAdmin, viewSingleAdmin, editAdmin } = require("../controllers/adminController");
const { getTransactions, deleteTransactions } = require("../controllers/transactionController");
const { resetPassword, forgotPassword, getUserFullName } = require("../controllers/userController");
const {adminProtect, adminRoleProtect, protect} = require("../middleWare/authMiddleware");
const router = express.Router();

router.get("/getAdmin/:id", adminProtect, viewSingleAdmin)
router.delete("/:id", adminProtect, deleteAdmin)
router.post("/addadmin", adminRoleProtect(['Super']), addadmin);
router.patch("/editAdmin", adminProtect, adminRoleProtect(['Super']), editAdmin)
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
router.get("/get-total-admin", adminProtect, getTotalAdmin)
router.get('/admin-list', adminProtect, viewAdmins)
router.post('/clear-transactions', adminProtect, deleteTransactions)


module.exports = router;