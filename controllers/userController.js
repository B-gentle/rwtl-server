const asyncHandler = require("express-async-handler")
const User = require("../models/userModel");
const Package = require("../models/packageModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const errorHandler = require("../middleWare/errorMiddleware");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utilities/sendEmail");



// function to generate referral code
const generateReferralCode = (id, username) => {
    return `REF${id.slice(-5).toUpperCase()}${username}`;
};

// function to generate referral link
const generateReferralLink = (referralCode) => {
    return `https://myrechargewise.com/signup?referralLink=${referralCode}`;
};


// generate Token function
const generateToken = (id) => {
    return jwt.sign({
        id
    }, process.env.jwtSecret, {
        expiresIn: "1d"
    })
}

const calculateUplineBonuses = (paidAmount) => {
    const generations = [{
        generation: "firstGeneration",
        percentage: 25
    },
    {
        generation: "secondGeneration",
        percentage: 6
    },
    {
        generation: "thirdGeneration ",
        percentage: 5
    },
    {
        generation: "fourthGeneration",
        percentage: 2
    },
    {
        generation: "fifthGeneration",
        percentage: 1.5
    },
    {
        generation: "sixthGeneration",
        percentage: 1.5
    },
    {
        generation: "seventhGeneration",
        percentage: 1
    },
    {
        generation: "eighthGeneration",
        percentage: 1
    },
    {
        generation: "ninthGeneration",
        percentage: 1
    },
    {
        generation: "tenthGeneration",
        percentage: 1
    }
    ]

    const bonuses = generations.map((generation, index) => {
        const bonusAmount = Math.round(paidAmount * (generation.percentage / 100));
        return {
            generation: generation.generation,
            bonusAmount
        }
    }

    )
    return bonuses;
}

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
        email
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
    const token = generateToken(_id);

    //send http-only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //1 day
        sameSite: "none",
        secure: true
    })

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
        email,
        password
    } = req.body
    if (!email || !password) {
        res.status(404)
        throw new Error("Enter email and password")
    }

    //check if user exist
    const user = await User.findOne({
        email
    })
    if (!user) {
        res.status(400);
        throw new Error("user does not exist")
    }

    //check if password is correct
    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    if (!passwordIsCorrect) {
        throw new Error("Invalid Password")
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
}