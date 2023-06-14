const asyncHandler = require("express-async-handler");
const Transaction = require("../models/transactionModel");
const axios = require('axios');
const User = require("../models/userModel");
const Package = require('../models/packageModel');

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1; // Adding 1 to get a 1-based month
const currentHour = currentDate.getHours();
const currentMinutes = currentDate.getMinutes();


const getTransactions = async (req, res) => {
    try {
      const userId = req.user.id; 
      const transactions = await Transaction.find({ user: userId });
  
      if (transactions) {
        res.status(200).json({ data: transactions });
      }
    } catch (error) {
      res.status(400).json({ message: 'Error retrieving transactions' });
    }
  };
  

const sendMoney = asyncHandler(async (req, res) => {
    const {
        username,
        amount
    } = req.body;

    try {

        const receiver = await User.findOne({
            username
        });
        if (!receiver) {
            return res.status(400).json({
                message: "incorrect username"
            })
        }

        if (req.user.walletBalance <= amount) {
            res.status(400)
            throw new Error("insufficient funds")
        }

        req.user.walletBalance -= amount;
        receiver.walletBalance += amount;
        await req.user.save();
        await receiver.save();


        const transactionId = username + `${currentYear}${currentMonth}${currentHour}${currentMinutes}`;
        const transaction = new Transaction({
            transactionId,
            transactionType: 'transfer',
            user: req.user._id,
            recipient: receiver.fullname,
            amount,
            status: 'successful',
        })
        await transaction.save()
        return res.status(200).json({
            message: 'Transfer successful'
        })
    } catch (error) {
        console.log(error)
        res.status(500)
        throw new Error("Transaction failed")
    }
})


const purchaseAirtime = async (req, res) => {
    const {
        network,
        phoneNumber,
        amount
    } = req.body;

    // Check if required data is provided
    if (!network || !phoneNumber) {
        return res.status(400).json({
            message: 'Please provide all the required fields'
        });
    }

    // Define the discount rates for each mobile network
    const discountRates = {
        '01': 3.5, // MTN @ 3.5%
        '02': 8, // Glo @ 8%
        '04': 3.5, // Airtel @ 3.5%
        '03': 6.5 // 9mobile @ 6.5%
    };

    // Check if the provided mobile network is valid
    if (!discountRates.hasOwnProperty(network)) {
        return res.status(400).json({
            message: 'Invalid mobile network code'
        });
    }

    // Check if the user has sufficient balance in their wallet
    if (req.user.walletBalance < amount) {
        return res.status(400).json({
            message: 'Insufficient wallet balance'
        });
    }

    // Calculate the bonus amount based on the discount rate
    const discountRate = discountRates[network];
    const bonusAmount = (amount * (discountRate / 100) * 0.4).toFixed(2);
    const transactionId = req.user.username + `${currentYear}${currentMonth}${currentHour}${currentMinutes}`;

    // Make the API call to purchase airtime
    try {
        const response = await axios.get('https://www.nellobytesystems.com/APIAirtimeV1.asp', {
            params: {
                UserID: process.env.CLUB_KONNECT_USER_ID,
                APIKey: process.env.CLUB_KONNECT_API_KEY,
                MobileNetwork: network,
                Amount: amount,
                MobileNumber: phoneNumber,
                RequestID: transactionId,
                CallBackURL: 'https;//localhost:5000/'
            }
        });
        // Check if the airtime purchase was successful
        if (response.statusText === 'OK') {
            // Perform additional operations here
            // Deduct the purchase amount from the user's wallet balance
            req.user.walletBalance -= amount;
            const currentUser = await User.findById(req.user.id).populate('package');

            // Add the bonus amount to the user's balance
            currentUser.commissionBalance += parseFloat(bonusAmount);

            // Create a new transaction object
            const transaction = new Transaction({
                transactionId,
                transactionType: 'airtime',
                status: 'successful',
                commission: bonusAmount,
                network,
                phoneNumber,
                amount,
                user: req.user._id
            });

            // Save the transaction object
            await transaction.save();
            await currentUser.save();

            // Get the user's package details
            const userPackage = currentUser.package;

            // Check if the package has transaction levels defined
            if (userPackage && userPackage.transaction && userPackage.transaction.level > 0) {
                const transactionLevels = userPackage.transaction.level;

                // Determine the bonus levels based on the user's package and referralBonusLevel
                const bonusLevels = Math.min(transactionLevels, userPackage.referralBonusLevel);

                // Calculate and pay uplines based on package levels and percentages
                let uplineUser = currentUser;
                for (let i = 0; i < bonusLevels; i++) {
                    // Check if upline user exists
                    if (!uplineUser.upline) {
                        break; // No more upline to calculate bonuses for
                    }

                    const upline = await User.findById(uplineUser.upline.ID).populate('package');

                    // Check if upline user has a package and earning level
                    if (upline.package && upline.package.transaction.level >= i + 1) {
                        const transactionProfit = parseFloat((amount * upline.package.transaction.percentage) / 100).toFixed(2);
                        upline.commissionBalance += parseFloat(transactionProfit);
                        await upline.save();
                    }

                    // Move to the next upline user
                    uplineUser = upline;
                }
            }

            return res.status(200).json({
                message: 'Airtime purchase successful',
                bonusAmount
            });
        } else {
            // Return error response if the airtime purchase failed
            return res.status(400).json({
                message: 'Failed to purchase airtime'
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};


module.exports = {
    purchaseAirtime,
    sendMoney,
    getTransactions
}