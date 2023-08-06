const asyncHandler = require("express-async-handler")
const Admin = require("../models/adminModel");
const Package = require("../models/packageModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const errorHandler = require("../middleWare/errorMiddleware");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utilities/sendEmail");
const User = require("../models/userModel");
const addToDownline = require("../utilities/addToDownline");
const Transaction = require("../models/transactionModel");
const calculateUplineBonuses = require("../utilities/uplineBonuses");
const Notification = require("../models/notificationModel");
const QualifiedUser = require("../models/qualifiedUsersModel");

// generate Token function
const generateToken = (id) => {
    return jwt.sign({
        id
    }, process.env.jwtSecret, {
        expiresIn: "1d"
    })
}

const addadmin = asyncHandler(async (req, res) => {
    const {
        fullname,
        username,
        email,
        password,
        role,
        phoneNo,
        pv,
        walletBalance
    } = req.body;

    //admin validation
    if (!fullname || !email || !password || !role) {
        res.status(400)
        throw new Error("Please fill in all fields")
    }


    //check if admin exist
    const AdminExist = await Admin.findOne({
        email
    })
    if (AdminExist) {
        res.status(404)
        throw new Error("username already exist")
    }


    //create new admin
    const admin = new Admin({
        email,
        fullname,
        username,
        password,
        role,
        phoneNo,
        pv,
        walletBalance
    })

    const {
        _id
    } = admin;

    const saveAdmin = await admin.save();
    // generate Token
    const token = generateToken(_id);

    //send http-only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //1 day
        sameSite: "none",
        secure: true
    })

    if (saveAdmin) {
        res.status(201).json({
            _id,
            username,
            token
        });
    } else {
        res.status(400)
        throw new Error("Admin not created successfully")
    }
});

const loginAdmin = asyncHandler(async (req, res) => {
    const {
        email,
        password
    } = req.body
    if (!email || !password) {
        res.status(404)
        throw new Error("Enter username and password")
    }

    //check if admin exist
    const admin = await Admin.findOne({
        email
    })
    if (!admin) {
        res.status(400);
        throw new Error("admin does not exist")
    }

    //check if password is correct
    const passwordIsCorrect = await bcrypt.compare(password, admin.password);
    if (!passwordIsCorrect) {
        throw new Error("Invalid Password")
    }

    if (admin && passwordIsCorrect) {
        const {
            _id
        } = admin
        const token = generateToken(_id)
        //send http-only cookie
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), //1 day
            sameSite: "none",
            secure: true
        })
        res.status(200).json({
            token,
            _id
        })
    } else {
        res.status(400)
        throw new Error("Invalid username or password")
    }

})

const logout = asyncHandler(async (req, res) => {
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0), //1 day
        sameSite: "none",
        secure: true
    })
    return res.status(200).json({
        message: "logged out successfully"
    })
});

const getLoggedInAdmin = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.admin._id)

    if (admin) {
        admin.password = undefined

        res.status(200).json({
            data: admin
        })
    } else {
        res.status(404)
        throw new Error("User not recognized")
    }
})

const loginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token
    if (!token) {
        return res.json(false)
    }

    const decryptedToken = jwt.verify(token, process.env.jwtSecret)
    if (decryptedToken) {
        return res.json(true)
    }
    return res.json(false)
})

const getPendingRegisteredUsers = asyncHandler(async (req, res) => {
    const users = await User.find({
        pv: 0
    });
    if (users) {
        res.status(200).json({
            data: users
        })
    } else {
        throw new error("users not retrieved")
    }
})

const completeUserRegistration = asyncHandler(async (req, res) => {

    const {
        email
    } = req.body;

    const user = await User.findOne({
        email
    })
    if (!user) {
        res.status(400)
        throw new Error("User not found")
    }

    // Get the selected package
    const selectedPackage = await Package.findOne({
        name: user.package.name
    });
    if (!selectedPackage) {
        res.status(404)
        throw new Error("selected package not found")
    }

    //update user details
    user.pv = selectedPackage.pv;
    user.monthlyPv = selectedPackage.pv;
    user.walletBalance = selectedPackage.amount * selectedPackage.instantCashBack;
    user.password = user.passkey;
    // add user to upline's downline
    addToDownline(user.username, user.upline.ID, user._id, selectedPackage.name, selectedPackage.pv)
    user.passkey = undefined;
    calculateUplineBonuses(user.upline.ID, selectedPackage._id, selectedPackage.pv)
    const registered = await user.save();
    if (registered) {
        // Reset Email
        const url = 'https://myrechargewise.com/login'
        const message = `
         <h2>Hello ${user.fullname}</h2>
         <p>Your Registration on myrechargewise was successful for the ${user.package.name} package. Click on the link below to login to your account. with username: ${user.username} and your password.</p>
         <a href=${url} clicktracking=off>Click here to login</a>
         <small>Best Regards</small>
         <span>RechargeWise Technologies</span>`;

        const subject = "Registration Successful"
        const send_to = user.email;
        const sent_from = process.env.EMAIL_USER;
        const reply_to = "noreply@RWTL.com";
        try {
            await sendEmail(subject, message, send_to, sent_from, reply_to)
        } catch (error) {}
        res.status(201).json({
            message: 'User registration completed'
        });
    }
});

const creditUserWallet = asyncHandler(async (req, res) => {
    const {
        username,
        amount
    } = req.body;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Adding 1 to get a 1-based month
    const currentHour = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();
    const transactionId = username + `${currentYear}${currentMonth}${currentHour}${currentMinutes}`;

    try {
        const receiver = await User.findOne({
            username
        });
        if (!receiver) {
            return res.status(400).json({
                message: "user not found"
            })
        }

        req.admin.walletBalance -= Number(amount);
        await req.admin.save();

        receiver.walletBalance += Number(amount);
        await receiver.save();

        const transaction = new Transaction({
            user: req.admin.id,
            transactionId,
            transactionType: 'fundTransfer',
            recipient: receiver.username,
            sender: req.admin.username,
            senderNewWalletBalance: req.admin.walletBalance,
            senderPrevWalletBalance: req.admin.walletBalance += Number(amount),
            receiverNewWalletBalance: receiver.walletBalance,
            receiverPrevWalletBalance: receiver.walletBalance -= Number(amount),
            amount,
            status: 'successful',
        });

        await transaction.save();

        res.status(200).json({
            message: 'User wallet credited successfully'
        });
    } catch (error) {
        res.status(500)
        throw new Error(error)
    }
});

const viewUserDetails = asyncHandler(async (req, res) => {
    const {
        username
    } = req.body;
    const user = await User.findOne({
        username
    })

    if (!user) {
        res.status(400)
        throw new Error('User does not exist')
    }
    user.password = undefined

    res.status(200).json({
        data: user
    })
})

const viewUserTransactions = asyncHandler(async (req, res) => {
    const {
        option,
        username,
        transactionType,
        from,
        to
    } = req.body;

    try {

        let query = {}
        const user = await User.findOne({
            username
        })
        
        if (option === 'username') {
            query = {
                $or: [{
                    sender: username
                }, {
                    receiver: username
                },
            {
                user: user.id
            }]
            }
        } else if (option === 'transactionType') {
            query = {
                transactionType: transactionType
            }
        } else if (option === 'createdAt') {
            query = {
                $or: [
                    { createdAt: { $gte: new Date(from) } },
                    { createdAt: { $lte: new Date(to) } }
                  ]
            }
        }

        const transactions = await Transaction.find(query).sort({ createdAt: -1 }).populate('user', 'username').exec();

        if (transactions) {
            res.status(200).json({
                data: transactions
            });
        } else {
            res.status(500)
            throw new Error(error.message)
        }
    } catch (error) {
        res.status(500)
        throw new Error(error.message)
    }
})

const viewQualifiedUsers = asyncHandler(async (req, res) => {
   
    try {

        const qualifiedUsers = await QualifiedUser.find().sort({ createdAt: -1 }).populate('user', 'username').exec();

        if (qualifiedUsers) {
            res.status(200).json(qualifiedUsers);
        } else {
            res.status(500)
            throw new Error(error.message)
        }
    } catch (error) {
        res.status(500)
        throw new Error(error.message)
    }
})

const editUserPersonalInformation = asyncHandler(async (req, res) => {
    const {
        fullname,
        username,
        email,
        commissionBalance,
        packageName,
        pv,
        walletBalance,
        withdrawableCommission
    } = req.body

    //find user
    try {
        const user = await User.findOne({
            username
        })

        if (user) {
            user.fullname = fullname || user.fullname;
            user.username = username || user.username
            user.email = email || user.email;
            user.commissionBalance = commissionBalance || user.commissionBalance
            // user.pv = pv || user.pv
            user.walletBalance = walletBalance || user.walletBalance
            user.withdrawableCommission = withdrawableCommission || user.withdrawableCommission
            const updatedUser = await user.save();
            if (updatedUser) {
                updatedUser.password = undefined;
                res.status(200).json(updatedUser)
            } else {
                throw new error(error.message)
            }
        } else {
            res.status(404)
            throw new Error("User not found")
        }
    } catch (error) {
        res.status(500)
        throw new Error(error.message)
    }


})

const editUserBankDetails = asyncHandler(async (req, res) => {
    const {
        username,
        accountName,
        accountNo,
        bankName,
    } = req.body

    //find user
    try {
        const user = await User.findOne({
            username
        })

        if (user) {
            user.bankName = bankName || user.bankName;
            user.accountName = accountName || user.accountName
            user.accountNo = accountNo || user.accountNo;
            const updatedUser = await user.save();
            if (updatedUser) {
                updatedUser.password = undefined;
                res.status(200).json(updatedUser)
            } else {
                throw new error(error.message)
            }
        } else {
            res.status(404)
            throw new Error("User not found")
        }
    } catch (error) {
        res.status(500)
        throw new Error(error.message)
    }
})

const changeUserPassword = asyncHandler(async (req, res) => {
    const {
        username,
        password
    } = req.body;
    try {
        const user = await User.findOne({
            username
        })
        if (user) {
            if (!password) {
                res.status(400)
                throw new Error("Please enter password")
            }

            user.password = password;
            const updatedPassword = await user.save();
            if (updatedPassword) {
                res.status(200).send("password changed successfully")
            } else {
                res.status(404)
                throw new Error("Unable to change password or incorrect old password")
            }

        } else {
            res.status(400)
            throw new Error("User not Found")
        }
    } catch (error) {
        res.status(500)
        throw new Error(error.message)
    }

})

const accessUserAccount = asyncHandler(async (req, res) => {
    const {
        username,
    } = req.body;
    try {
        if (!username) {
            res.status(404)
            throw new Error("Enter username and password")
        }

        //check if user exist
        const user = await User.findOne({
            username
        })
        if (user) {
            const {
                _id
            } = user
            const token = generateToken(_id)
            //send http-only cookie
            res.cookie("token", token, {
                path: "/",
                httpOnly: true,
                expires: new Date(Date.now() + 1000 * 86400), //1 day
                sameSite: "none",
                secure: true
            })
            res.status(200).json({
                token,
                _id
            })
        } else {
            res.status(400);
            throw new Error("user does not exist")
        }

    } catch (error) {
        res.status(500)
        console.log(error)
        throw new Error(error.messsage)
    }
})

const notifyUsers = asyncHandler(async (req, res) => {
    const {
        message,
    } = req.body;
    try {
        if (!message) {
            res.status(404)
            throw new Error("Enter message")
        }

        const notification = new Notification({
            message
        })

        await notification.save()
        res.status(200).json({
            message: 'Done'
        })

    } catch (error) {
        res.status(500)
        throw new Error(error.messsage)
    }
})

const editUsername = asyncHandler(async (req, res) => {
    const {
        username,
        newUsername,
    } = req.body

    //find user
    try {
        const user = await User.findOne({
            username
        })

        const newUserExist = await User.findOne({
            username: newUsername
        })

        if (user) {
            // Fetch the user's upline (if any)
            if (user.username === newUsername) {
                res.status(404)
                throw new Error('username cannot be same')
            }

            if (newUserExist) {
                res.status(404)
                throw new Error('Username already exist')
            }
            const upline = user.upline.ID ? await User.findById(user.upline.ID) : null;
            user.username = newUsername || user.username
            const updatedUser = await user.save();
            if (updatedUser) {
                updatedUser.password = undefined;
                res.status(200).json(updatedUser)
            } else {
                throw new error(error.message)
            }

            // Update downlines' usernames in the upline's document
            if (upline) {
                upline.downlines.forEach((downline) => {
                    if (downline.userId.toString() === updatedUser._id.toString()) {
                        downline.username = updatedUser.username;
                    }
                });
                await upline.save();
                await User.updateMany({
                    'upline.ID': updatedUser._id.toString()
                }, {
                    $set: {
                        'upline.username': updatedUser.username
                    }
                });
            }


        } else {
            res.status(404)
            throw new Error("User not found")
        }
    } catch (error) {
        res.status(500)
        throw new Error(error.message)
    }


})






module.exports = {
    addadmin,
    completeUserRegistration,
    creditUserWallet,
    loginAdmin,
    logout,
    getLoggedInAdmin,
    loginStatus,
    getPendingRegisteredUsers,
    viewUserDetails,
    viewUserTransactions,
    viewQualifiedUsers,
    editUserPersonalInformation,
    editUserBankDetails,
    changeUserPassword,
    accessUserAccount,
    notifyUsers,
    editUsername
};