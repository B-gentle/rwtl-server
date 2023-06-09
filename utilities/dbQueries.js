const mongoose = require("mongoose");
const Admin = require("../models/adminModel");
const CurrentDate = require("../models/dateModel");
const Package = require("../models/packageModel");
const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");

const resetmonthlypv = async (req, res) => {
    try {
        await User.updateMany({
            monthlyPv: 0
        })
        res.status(200).json({
            message: 'status updated successfullly'
        })
    } catch (err) {
        res.status(500)
        throw new Error(error.message)
    }

}

const insertQuery = async (req, res) => {
    const currentDay = new Date().getDate();
    const currentMonth = new Date().getMonth() + 1; // January is month 0, so we add 1 to get the correct month number.
    const currentYear = new Date().getFullYear();

    const commissions =  { "level": 6, "percentage": 0.0010 }
           
    try {
        await Package.updateMany({}, {
            transaction: commissions
        })
        // await CurrentDate.create({Day: 2, Month: 6, Year: currentYear});
        res.status(200).json({
            message: 'transaction updated successfully'
        })
    } catch (error) {
        console.log(error)
        res.status(500)
        throw new Error(error.message)
    }
};

const findTransactionsWithSameSenderAndRecipient = async (req, res) => {
    try {
        const transactions = await User.find({
                fullname: /Ogule/
            }

        );
        res.status(200).json({
            data: transactions
        })
    } catch (error) {
        console.log(error)
        res.status(500)
        throw new Error('Error finding transactions:', error.message)
    }
};

module.exports = {
    resetmonthlypv,
    findTransactionsWithSameSenderAndRecipient,
    insertQuery
}