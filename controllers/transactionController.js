const asyncHandler = require("express-async-handler");
const Transaction = require("../models/transactionModel");
const axios = require('axios');
const User = require("../models/userModel");
const Package = require('../models/packageModel');
const DataPlan = require("../models/dataPlansModel");
const payUplines = require("../utilities/transactionPayUpline");

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1; // Adding 1 to get a 1-based month
const currentHour = currentDate.getHours();
const currentMinutes = currentDate.getMinutes();


const getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await Transaction.find({
            user: userId,
            recipient: userId
        });

        if (transactions) {
            res.status(200).json({
                data: transactions
            });
        }
    } catch (error) {
        res.status(400).json({
            message: 'Error retrieving transactions'
        });
    }
};


const sendMoney = asyncHandler(async (req, res) => {
    const {
        username,
        amount
    } = req.body;

    try {

        const currentUser = await User.findById(req.user.id)
        const receiver = await User.findOne({
            username
        });
        if (!receiver) {
            return res.status(400).json({
                message: "incorrect username"
            })
        }

        if (currentUser.walletBalance < amount) {
            res.status(400)
            throw new Error("insufficient funds")
        }

        currentUser.walletBalance -= Number(amount);
        receiver.walletBalance += Number(amount);
        await currentUser.save();
        await receiver.save();


        const transactionId = currentUser.username + `${currentYear}${currentMonth}${currentHour}${currentMinutes}`;
        const transaction = new Transaction({
            transactionId,
            transactionType: 'fundTransfer',
            user: req.user.id,
            recipient: receiver.username,
            receiverNewWalletBalance: receiver.walletBalance,
            senderNewWalletBalance: currentUser.walletBalance,
            receiverPrevWalletBalance: receiver.walletBalance -= Number(amount),
            senderPrevWalletBalance: currentUser.walletBalance += Number(amount),
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

const transferCommission = asyncHandler(async (req, res) => {
    const {
        amount
    } = req.body;

    try {

        const currentUser = await User.findById(req.user.id);

        if (currentUser.withdrawableCommission < amount) {
            res.status(400)
            throw new Error("insufficient funds")
        }

        if (currentUser.withdrawableCommission >= amount){
            currentUser.withdrawableCommission -= amount;
            currentUser.walletBalance += Number(amount);
        }

        await currentUser.save();

        const transactionId = currentUser.username + `${currentYear}${currentMonth}${currentHour}${currentMinutes}`;
        const transaction = new Transaction({
            transactionId,
            transactionType: 'commissionTransfer',
            prevCommissionBalance: currentUser.withdrawableCommission - Number(amount),
            newCommissionBalance: currentUser.withdrawableCommission,
            prevWalletBalance: currentUser.walletBalance - Number(amount),
            newWalletBalance: currentUser.walletBalance,
            user: req.user._id,
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

    const currentUser = await User.findById(req.user.id).populate('package');

    // Check if the user has sufficient balance in their wallet
    if (currentUser.walletBalance < amount) {
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
        if (response.status === 200) {
            // Deduct the purchase amount from the user's wallet balance
          currentUser.walletBalance -= Number(amount)
            // Add the bonus amount to the user's balance
            currentUser.commissionBalance += parseFloat(bonusAmount);
            currentUser.withdrawableCommission += parseFloat(bonusAmount);
            await currentUser.save();

            // Create a new transaction object
            const transaction = new Transaction({
                transactionId,
                transactionType: 'airtime',
                status: 'successful',
                commission: bonusAmount,
                network,
                phoneNumber,
                prevWalletBalance: currentUser.walletBalance + Number(amount),
                newWalletBalance: currentUser.walletBalance,
                amount,
                user: req.user._id
            });

            // Save the transaction object
            await transaction.save();

            // Calculate and pay uplines based on package levels and percentages
            payUplines(currentUser.upline.ID, bonusAmount)


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

const purchaseData = async (req, res) => {
    const {
        network,
        phoneNumber,
        amount,
        networkPlan
    } = req.body;

    // Check if required data is provided
    if (!network || !phoneNumber || !networkPlan) {
        return res.status(400).json({
            message: 'Please provide all the required fields'
        });
    }

    // Define the profit for each mobile network
    const matchingPlan = await DataPlan.findOne({
        "plans.productCode": networkPlan
    });

    // Check if the requested plan is available
    if (!matchingPlan) {
        res.status(400);
        throw new Error("Selected Plan not available");
    }

    const plan = matchingPlan.plans.find((plan) => plan.productCode === networkPlan);
    const profit = plan.difference;

    const currentUser = await User.findById(req.user.id).populate('package');

    // Check if the user has sufficient balance in their wallet
    if (currentUser.walletBalance < amount) {
        return res.status(400).json({
            message: 'Insufficient wallet balance'
        });
    }

    // Calculate the bonus amount based on the profit
    const bonusAmount = (profit * 0.4).toFixed(2);
    const transactionId = req.user.username + `${currentYear}${currentMonth}${currentHour}${currentMinutes}`;

    // Make the API call to purchase data
    try {
        const response = await axios.get('https://www.nellobytesystems.com/APIDatabundleV1.asp', {
            params: {
                UserID: process.env.CLUB_KONNECT_USER_ID,
                APIKey: process.env.CLUB_KONNECT_API_KEY,
                MobileNetwork: network,
                DataPlan: networkPlan,
                MobileNumber: phoneNumber,
                RequestID: transactionId,
                CallBackURL: 'https://localhost:5000/'
            }
        });

        // Check if the data purchase was successful
        if (response.status === 200) {

            // Deduct the purchase amount from the user's wallet balance
            currentUser.walletBalance -= Number(amount)
            // Add the bonus amount to the user's balance
            currentUser.commissionBalance += parseFloat(bonusAmount);
            currentUser.withdrawableCommission += parseFloat(bonusAmount);
            await currentUser.save();

            // Create a new transaction object
            const transaction = new Transaction({
                transactionId,
                transactionType: 'data',
                status: 'successful',
                commission: bonusAmount,
                network,
                phoneNumber,
                prevWalletBalance: currentUser.walletBalance + Number(amount),
                newWalletBalance: currentUser.walletBalance,
                amount,
                user: req.user._id
            });

            // Save the transaction object
            await transaction.save();

            //database transaction - learn it.

            // Calculate and pay uplines based on package levels and percentages
            payUplines(currentUser.upline.ID, profit)

            return res.status(200).json({
                message: 'Data purchase successful',
                bonusAmount
            });
        } else {
            // Return error response if the data purchase failed
            return res.status(400).json({
                message: 'Failed to purchase Data'
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

const cableBills = async (req, res) => {
    const {
        network,
        number,
        amount,
        package
    } = req.body;

    // Check if required data is provided
    if (!network || !number || !package) {
        return res.status(400).json({
            message: 'Please provide all the required fields'
        });
    }

    // Define the profit for each mobile network
    const profit = amount * 0.80

    const currentUser = await User.findById(req.user.id).populate('package');

    // Check if the user has sufficient balance in their wallet
    if (currentUser.walletBalance < amount) {
        return res.status(400).json({
            message: 'Insufficient wallet balance'
        });
    }

    // Calculate the bonus amount based on the profit
    const bonusAmount = (profit * 0.4).toFixed(2);
    const transactionId = req.user.username + `${currentYear}${currentMonth}${currentHour}${currentMinutes}`;

    // Make the API call to purchase data
    try {
        const response = await axios.get('https://www.nellobytesystems.com/APICableTVV1.asp', {
            params: {
                UserID: process.env.CLUB_KONNECT_USER_ID,
                APIKey: process.env.CLUB_KONNECT_API_KEY,
                CableTV: network,
                Package: package,
                SmartCardNo: number,
                PhoneNo: currentUser.phoneNo,
                RequestID: transactionId,
                CallBackURL: 'https://localhost:5000/'
            }
        });

        // Check if the data purchase was successful
        if (response.statusText === 'OK') {

            // Deduct the purchase amount from the user's wallet balance
            currentUser.walletBalance -= amount
            // Add the bonus amount to the user's balance
            currentUser.commissionBalance += parseFloat(bonusAmount);

            // Create a new transaction object
            const transaction = new Transaction({
                transactionId,
                transactionType: 'cableTv',
                status: 'successful',
                commission: bonusAmount,
                cableCompany: network,
                IUC: number,
                amount,
                user: req.user._id
            });

            // Save the transaction object
            await transaction.save();
            await currentUser.save();

            //database transaction - learn it.

            // Calculate and pay uplines based on package levels and percentages
            payUplines(currentUser.upline.ID, profit)

            return res.status(200).json({
                message: 'Cable Bill Paid',
                bonusAmount
            });
        } else {
            // Return error response if the data purchase failed
            return res.status(400).json({
                message: 'Payment Failed'
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

const electricityBills = async (req, res) => {
    const {
        ElectricCompany,
        MeterType,
        amount,
        MeterNo
    } = req.body;

    // Check if required data is provided
    if (!ElectricCompany || !MeterNo || !MeterType) {
        return res.status(400).json({
            message: 'Please provide all the required fields'
        });
    }

    // Define the profit for each mobile network
    const profit = amount * 0.40

    const currentUser = await User.findById(req.user.id).populate('package');

    // Check if the user has sufficient balance in their wallet
    if (currentUser.walletBalance < amount) {
        return res.status(400).json({
            message: 'Insufficient wallet balance'
        });
    }

    // Calculate the bonus amount based on the profit
    const bonusAmount = (profit * 0.4).toFixed(2);
    const transactionId = req.user.username + `${currentYear}${currentMonth}${currentHour}${currentMinutes}`;

    // Make the API call to purchase data
    try {
        const response = await axios.get('https://www.nellobytesystems.com/APIElectricityV1.asp', {
            params: {
                UserID: process.env.CLUB_KONNECT_USER_ID,
                APIKey: process.env.CLUB_KONNECT_API_KEY,
                ElectricCompany,
                MeterType,
                MeterNo,
                PhoneNo: currentUser.phoneNo,
                RequestID: transactionId,
                CallBackURL: 'https://localhost:5000/'
            }
        });

        // Check if the data purchase was successful
        if (response.statusText === 'OK') {

            // Deduct the purchase amount from the user's wallet balance
            currentUser.walletBalance -= amount
            // Add the bonus amount to the user's balance
            currentUser.commissionBalance += parseFloat(bonusAmount);

            // Create a new transaction object
            const transaction = new Transaction({
                transactionId,
                transactionType: 'electricity',
                status: 'successful',
                commission: bonusAmount,
                electricCompany: ElectricCompany,
                meterNo: MeterNo,
                amount,
                user: req.user._id
            });

            // Save the transaction object
            await transaction.save();
            await currentUser.save();

            //database transaction - learn it.

            // Calculate and pay uplines based on package levels and percentages
            payUplines(currentUser.upline.ID, profit)

            return res.status(200).json({
                message: 'Cable Bill Paid',
                bonusAmount
            });
        } else {
            // Return error response if the data purchase failed
            return res.status(400).json({
                message: 'Payment Failed'
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
    getTransactions,
    purchaseData,
    cableBills,
    electricityBills,
    transferCommission
}