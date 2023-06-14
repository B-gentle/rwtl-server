const express = require("express");
const { addadmin, creditUserWallet, completeUserRegistration, loginAdmin, logout, getLoggedInAdmin, loginStatus, getPendingRegisteredUsers } = require("../controllers/adminController");
const {  changePassword, resetPassword, forgotPassword } = require("../controllers/userController");
const {adminProtect} = require("../middleWare/authMiddleware");
const router = express.Router();

router.post("/addadmin", addadmin);
router.patch("/credit", adminProtect, creditUserWallet);
router.post("/login", loginAdmin);
router.patch("/completeRegistration", adminProtect, completeUserRegistration)
router.post("/forgotpassword", forgotPassword)
router.put("/resetpassword/:restToken", resetPassword)
router.get("/logout", logout)
router.get("/loginstatus", loginStatus)
router.get("/getadmin", adminProtect, getLoggedInAdmin)
router.get("/getpendingregistrations", adminProtect, getPendingRegisteredUsers)

router.patch("/changepassword", adminProtect, changePassword)


module.exports = router;