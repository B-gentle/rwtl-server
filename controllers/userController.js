const asyncHandler = require("express-async-handler")
const User = require("../models/userModel");
const Package = require("../models/packageModel");
const Transaction = require("../models/transactionModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const errorHandler = require("../middleWare/errorMiddleware");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utilities/sendEmail");
const addToDownline = require("../utilities/addToDownline");
const calculateUplineBonuses = require("../utilities/uplineBonuses");
const Incentives = require("../models/incentivesModel");



// function to generate referral code
const generateReferralCode = (id, username) => {
    return `REF${id.slice(-5).toUpperCase()}${username}`;
};

// function to generate referral link
const generateReferralLink = (referralCode) => {
    return `https://myrechargewise.com/signup?referralCode=${referralCode}`;
};


// generate Token function
const generateToken = (id) => {
    return jwt.sign({
        id
    }, process.env.jwtSecret, {
        expiresIn: "1d"
    })
}

// const calculateUplineBonuses = (paidAmount) => {
//     const generations = [{
//             generation: "firstGeneration",
//             percentage: 25
//         },
//         {
//             generation: "secondGeneration",
//             percentage: 6
//         },
//         {
//             generation: "thirdGeneration ",
//             percentage: 5
//         },
//         {
//             generation: "fourthGeneration",
//             percentage: 2
//         },
//         {
//             generation: "fifthGeneration",
//             percentage: 1.5
//         },
//         {
//             generation: "sixthGeneration",
//             percentage: 1.5
//         },
//         {
//             generation: "seventhGeneration",
//             percentage: 1
//         },
//         {
//             generation: "eighthGeneration",
//             percentage: 1
//         },
//         {
//             generation: "ninthGeneration",
//             percentage: 1
//         },
//         {
//             generation: "tenthGeneration",
//             percentage: 1
//         }
//     ]

//     const bonuses = generations.map((generation, index) => {
//             const bonusAmount = Math.round(paidAmount * (generation.percentage / 100));
//             return {
//                 generation: generation.generation,
//                 bonusAmount
//             }
//         }

//     )
//     return bonuses;
// }

const checks = asyncHandler(async (req, res) => {
    const {
        username,
        email,
    } = req.body

    const usernameExist = await User.findOne({
        username
    })

    const emailExist = await User.findOne({
        email
    })
    if (usernameExist) {
        res.status(404)
        throw new Error("username already exist")
    }
    if (emailExist) {
        res.status(404)
        throw new Error("email already exist")
    }
    res.status(200).json({
        message: ''
    })
})

const registerUser = asyncHandler(async (req, res) => {
    const {
        fullname,
        username,
        email,
        passkey,
        phoneNo,
        package,
        referralCode,
        bankName,
        accountName,
        accountNo
    } = req.body;

    //user validation
    if (!fullname || !email || !passkey) {
        res.status(400)
        throw new Error("Please fill in all fields")
    }

    //check if user exist
    const userExist = await User.findOne({
        username
    })
    if (userExist) {
        res.status(404)
        throw new Error("user already exist")
    }

    //selected package
    const selectedPackage = await Package.findById(package);

    //getting all bonuses to be paid to the upline
    // const uplineBonuses = calculateUplineBonuses(selectedPackage.amount)

    if (!selectedPackage) {
        res.status(404)
        throw new Error("package does not exist")
    }

    //check if upline exist
    const upline = await User.findOne({
        referralCode
    })
    if (!upline) {
        res.status(404)
        throw new Error("Invalid Referral Code")
    }

    //create new user
    const user = new User({
        email,
        fullname,
        username,
        passkey,
        phoneNo,
        bankName,
        accountName,
        accountNo,
        package: {
            name: selectedPackage.name,
            ID: selectedPackage._id,
        },
        // pv: selectedPackage.pv,
        // paidAmount: selectedPackage.amount,
        // uplineBonus: uplineBonuses
    })

    const {
        _id
    } = user;
    const stringId = _id.toString();

    //generate referral code and links
    user.referralCode = generateReferralCode(stringId, user.username);
    user.referralLink = generateReferralLink(user.referralCode)
    //add upline
    user.upline = {
        username: upline.username,
        ID: upline._id
    };

    // change from default free user
    // user.isFreeUser = selectedPackage ? false : true;

    const saveUSer = await user.save();
    // generate Token
    // const token = generateToken(_id);

    //send http-only cookie
    // res.cookie("token", token, {
    //     path: "/",
    //     httpOnly: true,
    //     expires: new Date(Date.now() + 1000 * 86400), //1 day
    //     sameSite: "none",
    //     secure: true
    // })

    if (saveUSer) {
        res.status(201).json({
            _id,
            username,
            token
        });
    } else {
        res.status(400)
        throw new Error("user not created successfully")
    }
})


const loginUser = asyncHandler(async (req, res) => {
    const {
        username,
        password
    } = req.body
    if (!username || !password) {
        res.status(404)
        throw new Error("Enter username and password")
    }

    //check if user exist
    const user = await User.findOne({
        username
    })
    if (!user) {
        res.status(400);
        throw new Error("user does not exist")
    }

    //check if password is correct
    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    if (!passwordIsCorrect) {
        res.status(400)
        throw new Error("Invalid Login Credentials")
    }

    if (user && passwordIsCorrect) {
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
        message: "User logged out successfully"
    })
});

const getLoggedInUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)

    if (user) {
        user.password = undefined

        res.status(200).json({
            data: user
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

const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    if (user) {
        user.fullname = req.body.fullname || user.fullname;
        user.username = user.username
        user.email = req.body.email || user.email;
        user.accountNo = req.body.accountNo || user.accountNo;
        user.bankName = req.body.bankName || user.bankName;
        user.accountName = req.body.accountName || user.accountName;
        const updatedUser = await user.save();
        if (updatedUser) {
            updatedUser.password = undefined;
            res.status(200).json({
                data: updatedUser
            })
        }
    } else {
        res.status(404)
        throw new Error("User not found")
    }

})

const upgradePackage = asyncHandler(async (req, res) => {
    const {
        packageId,
    } = req.body;
    const currentUser = await User.findById(req.user.id);
    const currentUserPackage = await Package.findById(currentUser.package.ID);
    const selectedPackage = await Package.findById(packageId);
    packageDifference = selectedPackage.amount - currentUserPackage.amount;
    packagePvDifference = selectedPackage.pv - currentUserPackage.pv;

    //check if user has sufficient balance
    if (currentUser.walletBalance < packageDifference) {
        res.status(400)
        throw new Error('Insufficient Wallet Balance')
    }

    // Update user's package in the user document
    currentUser.package.ID = selectedPackage._id;
    currentUser.package.name = selectedPackage.name;
    currentUser.walletBalance -= packageDifference;
    currentUser.commissionBalance += currentUserPackage.instantCashBack * packageDifference
    currentUser.withdrawableCommission += currentUserPackage.instantCashBack * packageDifference
    currentUser.directPv += packagePvDifference;
    currentUser.monthlyPv += packagePvDifference;
    currentUser.pv = currentUser.directPv + currentUser.indirectPv + currentUserPackage.pv + packagePvDifference;
    await currentUser.save();

    // Update user's package in downline documents
    try {
        await User.updateMany({
            'downlines.userId': currentUser._id
        }, {
            $set: {
                'downlines.$[elem].pv': pv,
                'downlines.$[elem].package.name': selectedPackage.name
            }
        }, {
            arrayFilters: [{
                'elem.userId': currentUser._id
            }]
        })
    } catch (error) {
        console.log(error)
    }


    try {
        let upline = await User.findById(currentUser.upline.ID);
        let userLevel = 1
        //pay referral bonus
        const userPackage = await Package.findById(currentUser.package.ID);

        if (upline && upline.package && upline.package.ID) {
            const uplinePackage = await Package.findById(upline.package.ID);
            const referralBonuses = uplinePackage.uplineBonuses

            for (const bonus of referralBonuses) {
                const {
                    bonusPercentage
                } = bonus;
                if (userLevel <= uplinePackage.referralBonusLevel) {
                    const referralBonus = packageDifference * bonusPercentage;
                    upline.withdrawableCommission += referralBonus;
                    upline.commissionBalance += referralBonus;
                    if (userLevel === 1) {
                        upline.directPv += packagePvDifference
                        upline.monthlyPv += packagePvDifference
                    } else if (userLevel >= 2 && userLevel <= 5) {
                        upline.indirectPv += 0.5 * packagePvDifference
                        upline.monthlyPv += 0.5 * packagePvDifference
                    } else if (userLevel >= 6 && userLevel <= 10) {
                        upline.indirectPv += 0.25 * packagePvDifference
                        upline.monthlyPv += 0.25 * packagePvDifference
                    }
                    upline.pv = upline.indirectPv + upline.directPv + uplinePackage.pv + packagePvDifference
                    upline.monthlyPv += packagePvDifference
                    await upline.save();
                } else {
                    console.log('error here')
                }

                if (upline && upline.upline && upline.upline.ID) {
                    upline = await User.findById(upline.upline.ID);
                    userLevel += 1;
                }
            }
        } else {
            console.log('bonus not paid')
        }


    } catch (error) {
        console.log(error)
    }


    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Adding 1 to get a 1-based month
    const currentHour = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();
    const transactionId = req.user.username + `${currentYear}${currentMonth}${currentHour}${currentMinutes}`;

    const transaction = new Transaction({
        transactionId,
        transactionType: 'upgrade',
        status: 'successful',
        transactionCategory: `upgrade from ${currentUserPackage.name} to ${selectedPackage.name}`,
        prevCommissionBalance: currentUser.withdrawableCommission - packageDifference,
        newCommissionBalance: currentUser.withdrawableCommission,
        prevWalletBalance: currentUser.walletBalance + packageDifference,
        newWalletBalance: currentUser.walletBalance,
        amount: packageDifference,
        user: req.user._id
    })

    // Save the transaction object
    await transaction.save();


    res.status(200).json({
        data: 'packageDifference'
    })

})

const changePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    if (!user) {
        res.status(400)
        throw new Error("User not Found")
    }

    const {
        oldPassword,
        password
    } = req.body;
    if (!oldPassword || !password) {
        res.status(400)
        throw new Error("Please fill in old and new password")
    }

    // check if old password matches the user's password in DB
    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password)

    if (user && passwordIsCorrect) {
        user.password = password;
        const updatedPassword = await user.save();
        if (updatedPassword) {
            res.status(200).send("password changed successfully")
        } else {
            res.status(404)
            throw new Error("Unable to change password or incorrect old password")
        }
    }

})

const forgotPassword = asyncHandler(async (req, res) => {
    const {
        email
    } = req.body
    const user = await User.findOne({
        email
    })

    if (!user) {
        res.status(404)
        throw new Error("User does not exist")
    }

    // Delete existing user token if any
    let token = await Token.findOne({
        userId: user._id
    })
    if (token) {
        await token.deleteOne()
    }

    // create reset token
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id
    // hash token before saving to DB
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    // save Token to DB
    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * (60 * 1000) //thirty minutes
    }).save()

    //construct reset url
    const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${resetToken}`

    // Reset Email
    const message = `
<h2>Hello ${user.fullname}</h2>
<p>Please click on the link below to reset your password</p>
<p>This link expires in 30 minutes</p>
<a href=${resetUrl} clicktracking=off>${resetUrl}</a>
<small>Best Regards</small>
<span>RechargeWise Technologies</span>`;

    const subject = "Password Reset Request"
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = "noreply@RWTL.com";

    try {
        await sendEmail(subject, message, send_to, sent_from, reply_to)
        res.status(200).json({
            success: true,
            message: "Reset email sent"
        })
    } catch (error) {
        res.status(500)
        throw new Error("Something went wrong, Please try again!")
    }
})

const resetPassword = asyncHandler(async (req, res) => {
    const {
        password
    } = req.body
    const {
        resetToken
    } = req.params

    // hash token then compare with the one in the DB
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    // find token in DB
    const userToken = await Token.findOne({
        token: hashedToken,
        expiresAt: {
            $gt: Date.now()
        }
    })

    if (!userToken) {
        res.status(404)
        throw new Error("Invalid or Expired Token")
    }

    // find User
    const user = await User.findOne({
        _id: userToken.userId
    })
    user.password = password
    await user.save();
    res.status(200).json({
        message: "Password reset successful, Please Login"
    })
})

const addDownline = asyncHandler(async (req, res) => {

    const {
        fullname,
        username,
        email,
        password,
        phoneNo,
        package,
        bankName,
        accountName,
        accountNo
    } = req.body;

    //user validation
    if (!fullname || !email || !password || !username) {
        res.status(400)
        throw new Error("Please fill in all fields")
    }

    //check if user exist
    const userExist = await User.findOne({
        username
    })
    if (userExist) {
        res.status(404)
        throw new Error("user already exist")
    }

    //selected package
    const selectedPackage = await Package.findById(package);

    if (!selectedPackage) {
        res.status(404)
        throw new Error("package does not exist")
    }

    const currentUser = await User.findById(req.user.id);

    if (currentUser.walletBalance < selectedPackage.amount) {
        res.status(400)
        throw new Error("Insufficient Amount, cannot continue registration")
    }
    //     //create new user
    const user = new User({
        email,
        fullname,
        username,
        password,
        phoneNo,
        bankName,
        accountName,
        accountNo,
        package: {
            name: selectedPackage.name,
            ID: selectedPackage._id,
        },
        pv: selectedPackage.pv,
        paidAmount: selectedPackage.amount,
        // uplineBonus: uplineBonuses
    });

    const {
        _id
    } = user;
    const stringId = _id.toString();

    //     //generate referral code and links
    user.referralCode = generateReferralCode(stringId, user.username);
    user.referralLink = generateReferralLink(user.referralCode)
    user.walletBalance += selectedPackage.amount * selectedPackage.instantCashBack

    //     //add upline
    user.upline = {
        username: currentUser.username,
        ID: currentUser._id
    };

    const saveUSer = await user.save();

    if (saveUSer) {
        currentUser.walletBalance -= selectedPackage.amount;
        await currentUser.save();
        addToDownline(user.username, user.upline.ID, user._id, selectedPackage.name, selectedPackage.pv);
        calculateUplineBonuses(user.upline.ID, selectedPackage._id, selectedPackage.pv)
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
        } catch (error) {

        }

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // Adding 1 to get a 1-based month
        const currentHour = currentDate.getHours();
        const currentMinutes = currentDate.getMinutes();
        const transactionId = req.user.username + `${currentYear}${currentMonth}${currentHour}${currentMinutes}`;

        // Create a new transaction object
        const transaction = new Transaction({
            transactionId,
            transactionType: 'registration',
            status: 'successful',
            package: selectedPackage,
            registeredUser: user.username,
            amount: selectedPackage.amount,
            user: req.user._id
        });

        await transaction.save();

        res.status(201).json({
            _id,
            username,
            message: "User Registered Successfully"
        });
    } else {
        res.status(400)
        throw new Error("user not created successfully")
    }

})

const deleteUser = asyncHandler(async (req, res) => {
    const {
        userId
    } = req.body;
    try {
        // Find the user to be deleted
        const user = await User.findById(userId);
        if (!user) {
            res.status(400);
            throw new Error('User not found');
        }

        // Update the upline's downlines
        if (user.upline.ID) {
            const upline = await User.findById(user.upline.ID);
            if (upline) {
                upline.downlines = upline.downlines.filter((downline) => downline.userId.toString() !== userId);
                await upline.save();
            }
        }

        // Remove the user from other user's downlines
        await User.updateMany({
            'downlines.userId': userId
        }, {
            $pull: {
                downlines: {
                    userId: userId
                }
            }
        });

        // Delete the user document
        await User.findByIdAndDelete(userId);
        res.status(200).json({
            message: 'user deleted successfully'
        })
    } catch (error) {
        res.status(400)
        throw new Error(error)
    }

})

const getUserIncentives = asyncHandler(async (req, res) => {
    const currentUser = await User.findById(req.user.id);
    const incentives = await Incentives.find();
    const nextIncentive = incentives.find((incentive) => {
        return incentive.requiredPv > currentUser.pv
    });


    res.status(200).json({
        data: [nextIncentive]
    })
})

module.exports = {
    registerUser,
    loginUser,
    logout,
    getLoggedInUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,
    checks,
    addDownline,
    deleteUser,
    upgradePackage,
    getUserIncentives
}