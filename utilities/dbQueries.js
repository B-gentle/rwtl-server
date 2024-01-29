const mongoose = require("mongoose");
const Admin = require("../models/adminModel");
const CurrentDate = require("../models/dateModel");
const Package = require("../models/packageModel");
const JoenatechDataPlan = require("../models/joenatechMTNDataModel");
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

    const instantCashBackData = [
          { "level": 1, "bonusPercentage": 0.25 },
          { "level": 2, "bonusPercentage": 0.10 },
          { "level": 3, "bonusPercentage": 0.03 },
          { "level": 4, "bonusPercentage": 0.02 },
          { "level": 5, "bonusPercentage": 0.01 },
          { "level": 6, "bonusPercentage": 0.01 },
          { "level": 7, "bonusPercentage": 0.01 },
          { "level": 8, "bonusPercentage": 0.01 },
          { "level": 9, "bonusPercentage": 0.01 },
          { "level": 10, "bonusPercentage": 0.01 }
          ]
 
           
    try {
        await Package.updateMany({}, {
            uplineBonuses: instantCashBackData
        })
        // await CurrentDate.create({Day: 2, Month: 6, Year: currentYear});
        res.status(200).json({
            message: 'Package updated successfully'
        })
    } catch (error) {
        console.log(error)
        res.status(500)
        throw new Error(error.message)
    }
};

const insertDataPlans = async (req, res) => {
    
  const dataPlans = [
    {
      network: "MTN",
      networkId: 1,
      plans: [
        {
          PRODUCT_ID: 7,
          PRODUCT_NAME: "MTN SME 1GB for 1 month",
          planAmount:257 ,
        },
        {
          PRODUCT_ID: 8,
          PRODUCT_NAME: "MTN SME 2GB for 1 month",
          planAmount:514 ,
        },
        {
          PRODUCT_ID: 11,
          PRODUCT_NAME: "MTN SME 5GB for 1 month",
          planAmount:1275 ,
        },
        {
          PRODUCT_ID: 52,
          PRODUCT_NAME: "MTN GIFTING 1.5GB for 1 month",
          planAmount:1140 ,
        },
        {
          PRODUCT_ID: 56,
          PRODUCT_NAME: "MTN GIFTING 10GB for 1 month",
          planAmount:3325,
        },
        {
          PRODUCT_ID: 57,
          PRODUCT_NAME: "MTN GIFTING 20GB for 1 month",
          planAmount:5280 ,
        },
        {
          PRODUCT_ID: 59,
          PRODUCT_NAME: "MTN GIFTING 40GB for 1 month",
          planAmount:10450 ,
        },
        {
          PRODUCT_ID: 60,
          PRODUCT_NAME: "MTN GIFTING 75GB for 1 month",
          planAmount:15200 ,
        },
        {
          PRODUCT_ID: 61,
          PRODUCT_NAME: "MTN GIFTING 120GB for 1 month",
          planAmount:20900 ,
        },
        {
          PRODUCT_ID: 74,
          PRODUCT_NAME: "MTN GIFTING 12GB for 1 month",
          planAmount:3840 ,
        },
        {
          PRODUCT_ID: 91,
          PRODUCT_NAME: "MTN GIFTING 1GB for 1 month",
          planAmount:570 ,
        },
        {
          PRODUCT_ID: 209,
          PRODUCT_NAME: "MTN SME 10GB for 1 month",
          planAmount:2560 ,
        },
        {
          PRODUCT_ID: 210,
          PRODUCT_NAME: "MTN SME 500MB for 1 month",
          planAmount:129 ,
        },
        {
          PRODUCT_ID: 215,
          PRODUCT_NAME: "MTN GIFTING 400GB for 1 month",
          planAmount:47500 ,
        },
        {
          PRODUCT_ID: 216,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 1GB for 1 month",
          planAmount:260 ,
        },
        {
          PRODUCT_ID: 217,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 2GB for 1 month",
          planAmount:520 ,
        },
        {
          PRODUCT_ID: 218,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 3GB for 1 month",
          planAmount:780 ,
        },
        {
          PRODUCT_ID: 219,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 5GB for 1 month",
          planAmount:1300 ,
        },
        {
          PRODUCT_ID: 220,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 10GB for 1 month",
          planAmount:2600 ,
        },
        {
          PRODUCT_ID: 221,
          PRODUCT_NAME: "MTN GIFTING 200GB for 1 month",
          planAmount:28500 ,
  
        },
        {
          PRODUCT_ID: 223,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 20GB for 1 month",
          planAmount:5200 ,
        },
        {
          PRODUCT_ID: 225,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 500MB for 1 month",
          planAmount:130 ,
        },
        {
          PRODUCT_ID: 239,
          PRODUCT_NAME: "MTN SME 3GB for 1 month",
          planAmount:771 ,
        },
        {
          PRODUCT_ID: 246,
          PRODUCT_NAME: "MTN GIFTING 4GB for 1 month",
          planAmount:1900 ,
        },
        {
          PRODUCT_ID: 247,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 15GB for 1 month",
          planAmount:3900 ,
        },
        {
          PRODUCT_ID: 248,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 40GB for 1 month",
          planAmount:10400 ,
        },
        {
          PRODUCT_ID: 251,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 3GB for 1 month",
          planAmount:1520 ,
        },
        {
          PRODUCT_ID: 253,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 250MB for 1 month",
          planAmount:65 ,
        },
        {
          PRODUCT_ID: 281,
          PRODUCT_NAME: "MTN DATA COUPONS 3GB for 1 month",
          planAmount:750 ,
        },
        {
          PRODUCT_ID: 286,
          PRODUCT_NAME: "MTN DATA COUPONS 6GB for 1 month",
          planAmount:1600 ,
        },
        {
          PRODUCT_ID: 287,
          PRODUCT_NAME: "MTN DATA COUPONS 9GB for 1 month",
          planAmount:2500 ,
        },
        {
          PRODUCT_ID: 288,
          PRODUCT_NAME: "MTN DATA COUPONS 24GB for 1 month",
          planAmount:6000 ,
        },
        {
          PRODUCT_ID: 289,
          PRODUCT_NAME: "MTN DATA COUPONS 12GB for 1 month",
          planAmount:3000 ,
        },
        {
          PRODUCT_ID: 290,
          PRODUCT_NAME: "MTN DATA COUPONS 1GB for 1 month",
          planAmount:240 ,
        },
      ],
    },
    // {
    //   network: "9MOBILE",
    //   networkId: 3,
    //   plans: [{}],
    // },
  ];

 
  dataPlans.map(dataPlan => {
    dataPlan.plans.map(plan => {
      plan.PRODUCT_AMOUNT = (plan.planAmount * 0.08) + plan.planAmount; 
    });
  });
           
    try {
      await JoenatechDataPlan.deleteMany()
        await JoenatechDataPlan.insertMany(dataPlans)
        // await CurrentDate.create({Day: 2, Month: 6, Year: currentYear});
        res.status(200).json({
            message: 'Data Plans Inserted'
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
    insertQuery,
    insertDataPlans
}