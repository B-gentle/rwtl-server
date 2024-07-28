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
      monthlyPv: 0,
    });
    res.status(200).json({
      message: "status updated successfullly",
    });
  } catch (err) {
    res.status(500);
    throw new Error(error.message);
  }
};

const insertQuery = async (req, res) => {
  const currentDay = new Date().getDate();
  const currentMonth = new Date().getMonth() + 1; // January is month 0, so we add 1 to get the correct month number.
  const currentYear = new Date().getFullYear();

  const instantCashBackData = [
    { level: 1, bonusPercentage: 0.25 },
    { level: 2, bonusPercentage: 0.1 },
    { level: 3, bonusPercentage: 0.03 },
    { level: 4, bonusPercentage: 0.02 },
    { level: 5, bonusPercentage: 0.01 },
    { level: 6, bonusPercentage: 0.01 },
    { level: 7, bonusPercentage: 0.01 },
    { level: 8, bonusPercentage: 0.01 },
    { level: 9, bonusPercentage: 0.01 },
    { level: 10, bonusPercentage: 0.01 },
  ];

  try {
    await Package.updateMany(
      {},
      {
        uplineBonuses: instantCashBackData,
      }
    );
    // await CurrentDate.create({Day: 2, Month: 6, Year: currentYear});
    res.status(200).json({
      message: "Package updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error(error.message);
  }
};

const insertDataPlans = async (req, res) => {
  const dataPlans = [
    {
      network: "MTN",
      networkId: 1,
      plans: [
        {
          PRODUCT_ID: 210,
          PRODUCT_NAME: "MTN SME 500MB = ₦145 1 month",
          planAmount: 140,
          PRODUCT_AMOUNT: 140,
        },
        {
          PRODUCT_ID: 7,
          PRODUCT_NAME: "MTN SME 1GB = ₦290 1 month",
          planAmount: 285,
          PRODUCT_AMOUNT: 285,
        },
        {
          PRODUCT_ID: 8,
          PRODUCT_NAME: "MTN SME 2GB = ₦580 1 month",
          planAmount: 575,
          PRODUCT_AMOUNT: 575,
        },
        {
          PRODUCT_ID: 239,
          PRODUCT_NAME: "MTN SME 3GB = ₦870 1 month",
          planAmount: 865,
          PRODUCT_AMOUNT: 865,
        },
        {
          PRODUCT_ID: 11,
          PRODUCT_NAME: "MTN SME 5GB = ₦1450 1 month",
          planAmount: 1445,
          PRODUCT_AMOUNT: 1445,
        },
        {
          PRODUCT_ID: 209,
          PRODUCT_NAME: "MTN SME 10GB = ₦2900 1 month",
          planAmount: 2895,
          PRODUCT_AMOUNT: 2895,
        },
        {
          PRODUCT_ID: 293,
          PRODUCT_NAME: "MTN DATA AWOOF 1GB = ₦250",
          planAmount: 245,
          PRODUCT_AMOUNT: 245,
        },
        {
          PRODUCT_ID: 294,
          PRODUCT_NAME: "MTN DATA AWOOF 3.5GB = ₦2450",
          planAmount: 2445,
          PRODUCT_AMOUNT: 2445,
        },
        {
          PRODUCT_ID: 295,
          PRODUCT_NAME: "MTN DATA AWOOF 15GB = ₦3500",
          planAmount: 3495,
          PRODUCT_AMOUNT: 3495,
        },
        {
          PRODUCT_ID: 300,
          PRODUCT_NAME: "MTN DATA SHARE 500MB = ₦133 1 month",
          planAmount: 128,
          PRODUCT_AMOUNT: 128,
        },
        {
          PRODUCT_ID: 297,
          PRODUCT_NAME: "MTN DATA SHARE 1GB = ₦285",
          planAmount: 280,
          PRODUCT_AMOUNT: 280,
        },
        {
          PRODUCT_ID: 298,
          PRODUCT_NAME: "MTN DATA SHARE 2GB = ₦550",
          planAmount: 545,
          PRODUCT_AMOUNT: 545,
        },
        {
          PRODUCT_ID: 281,
          PRODUCT_NAME: "MTN DATA SHARE 3GB = ₦795",
          planAmount: 790,
          PRODUCT_AMOUNT: 790,
        },
        {
          PRODUCT_ID: 299,
          PRODUCT_NAME: "MTN DATA SHARE 5GB = ₦1350",
          planAmount: 1345,
          PRODUCT_AMOUNT: 1345,
        },
        {
          PRODUCT_ID: 253,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 250MB = ₦75 1 month",
          planAmount: 70,
          PRODUCT_AMOUNT: 70,
        },
        {
          PRODUCT_ID: 225,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 500MB = ₦150 1 month",
          planAmount: 145,
          PRODUCT_AMOUNT: 145,
        },
        {
          PRODUCT_ID: 216,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 1GB = ₦290 1 month",
          planAmount: 285,
          PRODUCT_AMOUNT: 285,
        },
        {
          PRODUCT_ID: 217,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 2GB = ₦580 1 month",
          planAmount: 575,
          PRODUCT_AMOUNT: 575,
        },
        {
          PRODUCT_ID: 218,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 3GB = ₦870 1 month",
          planAmount: 865,
          PRODUCT_AMOUNT: 865,
        },
        {
          PRODUCT_ID: 219,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 5GB = ₦1440 1 month",
          planAmount: 1435,
          PRODUCT_AMOUNT: 1435,
        },
        {
          PRODUCT_ID: 220,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 10GB = ₦2900 1 month",
          planAmount: 2895,
          PRODUCT_AMOUNT: 2895,
        },
        {
          PRODUCT_ID: 247,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 15GB = ₦4350 1 month",
          planAmount: 4345,
          PRODUCT_AMOUNT: 4345,
        },
        {
          PRODUCT_ID: 223,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 20GB = ₦5800 1 month",
          planAmount: 5795,
          PRODUCT_AMOUNT: 5795,
        },
        {
          PRODUCT_ID: 248,
          PRODUCT_NAME: "MTN CORPORATE GIFTING 40GB = ₦11,600 1 month",
          planAmount: 11595,
          PRODUCT_AMOUNT: 11595,
        },
        {
          PRODUCT_ID: 91,
          PRODUCT_NAME: "MTN GIFTING 1GB = ₦590 1 month",
          planAmount: 585,
          PRODUCT_AMOUNT: 585,
        },
        {
          PRODUCT_ID: 52,
          PRODUCT_NAME: "MTN GIFTING 1.5GB = ₦1185 1 month",
          planAmount: 1180,
          PRODUCT_AMOUNT: 1180,
        },
        {
          PRODUCT_ID: 251,
          PRODUCT_NAME: "MTN GIFTING 3GB = ₦1810 1 month",
          planAmount: 1805,
          PRODUCT_AMOUNT: 1805,
        },
        {
          PRODUCT_ID: 246,
          PRODUCT_NAME: "MTN GIFTING 4GB = ₦2210 1 month",
          planAmount: 2205,
          PRODUCT_AMOUNT: 2205,
        },
        {
          PRODUCT_ID: 56,
          PRODUCT_NAME: "MTN GIFTING 10GB ₦3825 1 month",
          planAmount: 3820,
          PRODUCT_AMOUNT: 3820,
        },
        {
          PRODUCT_ID: 74,
          PRODUCT_NAME: "MTN GIFTING 12GB = ₦4,220 1 month",
          planAmount: 4215,
          PRODUCT_AMOUNT: 4215,
        },
        {
          PRODUCT_ID: 57,
          PRODUCT_NAME: "MTN GIFTING 20GB = ₦5,890 1 month",
          planAmount: 5885,
          PRODUCT_AMOUNT: 5885,
        },
        {
          PRODUCT_ID: 59,
          PRODUCT_NAME: "MTN GIFTING 40GB = ₦11,640 1 month",
          planAmount: 11635,
          PRODUCT_AMOUNT: 11635,
        },
        {
          PRODUCT_ID: 60,
          PRODUCT_NAME: "MTN GIFTING 75GB = ₦17,470 1 month",
          planAmount: 17465,
          PRODUCT_AMOUNT: 17465,
        },
        {
          PRODUCT_ID: 61,
          PRODUCT_NAME: "MTN GIFTING 120GB = ₦24,500 1 month",
          planAmount: 24495,
          PRODUCT_AMOUNT: 24495,
        },
        {
          PRODUCT_ID: 221,
          PRODUCT_NAME: "MTN GIFTING 200GB = ₦34,500 1 month",
          planAmount: 34495,
          PRODUCT_AMOUNT: 34495,
        },
        {
          PRODUCT_ID: 215,
          PRODUCT_NAME: "MTN GIFTING 400GB = ₦59,500 1 month",
          planAmount: 59495,
          PRODUCT_AMOUNT: 59495,
        },
      ],
    },
    {
      network: "AIRTEL",
      networkId: 4,
      plans: [
        {
          PRODUCT_ID: 243,
          PRODUCT_NAME: "100MB AIRTEL CORPORATE GIFTING = ₦37 1 month",
          planAmount: 32,
          PRODUCT_AMOUNT: 32,
        },
        {
          PRODUCT_ID: 244,
          PRODUCT_NAME: "300MB AIRTEL CORPORATE GIFTING = ₦92 1 month",
          planAmount: 87,
          PRODUCT_AMOUNT: 87,
        },
        {
          PRODUCT_ID: 232,
          PRODUCT_NAME: "500MB AIRTEL CORPORATE GIFTING = ₦150 1 month",
          planAmount: 145,
          PRODUCT_AMOUNT: 145,
        },
        {
          PRODUCT_ID: 228,
          PRODUCT_NAME: "1GB AIRTEL CORPORATE GIFTING = ₦295 1 month",
          planAmount: 290,
          PRODUCT_AMOUNT: 290,
        },
        {
          PRODUCT_ID: 229,
          PRODUCT_NAME: "2GB AIRTEL CORPORATE GIFTING = ₦590 1 month",
          planAmount: 585,
          PRODUCT_AMOUNT: 585,
        },
        {
          PRODUCT_ID: 231,
          PRODUCT_NAME: "5GB AIRTEL CORPORATE GIFTING = ₦1475 1 month",
          planAmount: 1470,
          PRODUCT_AMOUNT: 1470,
        },
        {
          PRODUCT_ID: 240,
          PRODUCT_NAME: "10GB AIRTEL CORPORATE GIFTING = ₦2950 1 month",
          planAmount: 2945,
          PRODUCT_AMOUNT: 2945,
        },
        {
          PRODUCT_ID: 241,
          PRODUCT_NAME: "15GB AIRTEL CORPORATE GIFTING = ₦3575 1 month",
          planAmount: 3570,
          PRODUCT_AMOUNT: 3570,
        },
        {
          PRODUCT_ID: 242,
          PRODUCT_NAME: "20GB AIRTEL CORPORATE GIFTING = ₦5900 1 month",
          planAmount: 5895,
          PRODUCT_AMOUNT: 5895,
        },
        {
          PRODUCT_ID: 97,
          PRODUCT_NAME: "750MB AIRTEL GIFTING = ₦490 2 Weeks",
          planAmount: 485,
          PRODUCT_AMOUNT: 485,
        },
        {
          PRODUCT_ID: 236,
          PRODUCT_NAME: "1.2GB AIRTEL GIFTING = ₦985 1 Month",
          planAmount: 980,
          PRODUCT_AMOUNT: 980,
        },
        {
          PRODUCT_ID: 146,
          PRODUCT_NAME: "1.5GB AIRTEL GIFTING = ₦1180 1 Month",
          planAmount: 1175,
          PRODUCT_AMOUNT: 1175,
        },
        {
          PRODUCT_ID: 147,
          PRODUCT_NAME: "3GB AIRTEL GIFTING = ₦1500 1 Month",
          planAmount: 1495,
          PRODUCT_AMOUNT: 1495,
        },
        {
          PRODUCT_ID: 148,
          PRODUCT_NAME: "4.5GB AIRTEL GIFTING = ₦2025 1 Month",
          planAmount: 2020,
          PRODUCT_AMOUNT: 2020,
        },
        {
          PRODUCT_ID: 192,
          PRODUCT_NAME: "6GB AIRTEL GIFTING = ₦2200 1 Month",
          planAmount: 2195,
          PRODUCT_AMOUNT: 2195,
        },
        {
          PRODUCT_ID: 25,
          PRODUCT_NAME: "10GB AIRTEL GIFTING = ₦3100 1 Month",
          planAmount: 3095,
          PRODUCT_AMOUNT: 3095,
        },
        {
          PRODUCT_ID: 163,
          PRODUCT_NAME: "11GB AIRTEL GIFTING = ₦4100 1 Month",
          planAmount: 4095,
          PRODUCT_AMOUNT: 4095,
        },
        {
          PRODUCT_ID: 47,
          PRODUCT_NAME: "20GB AIRTEL GIFTING = ₦5250 1 Month",
          planAmount: 5245,
          PRODUCT_AMOUNT: 5245,
        },
        {
          PRODUCT_ID: 165,
          PRODUCT_NAME: "40GB AIRTEL GIFTING = ₦10,500 1 Month",
          planAmount: 10495,
          PRODUCT_AMOUNT: 10495,
        },
        {
          PRODUCT_ID: 191,
          PRODUCT_NAME: "75GB AIRTEL GIFTING = ₦16,000 1 Month",
          planAmount: 15995,
          PRODUCT_AMOUNT: 15995,
        },
        {
          PRODUCT_ID: 193,
          PRODUCT_NAME: "120GB AIRTEL GIFTING = ₦22,000 1 Month",
          planAmount: 21995,
          PRODUCT_AMOUNT: 21995,
        },
      ],
    },
    {
      network: "GLO",
      networkId: 2,
      plans: [
        {
          PRODUCT_ID: 272,
          PRODUCT_NAME: "200MB GLO CORPORATE GIFTING = ₦63 1 week",
          planAmount: 58,
          PRODUCT_AMOUNT: 58,
        },
        {
          PRODUCT_ID: 259,
          PRODUCT_NAME: "500MB GLO CORPORATE GIFTING = ₦153 2 Weeks",
          planAmount: 148,
          PRODUCT_AMOUNT: 148,
        },
        {
          PRODUCT_ID: 254,
          PRODUCT_NAME: "1GB GLO CORPORATE GIFTING = ₦153 1 Month",
          planAmount: 148,
          PRODUCT_AMOUNT: 148,
        },
        {
          PRODUCT_ID: 255,
          PRODUCT_NAME: "2GB GLO CORPORATE GIFTING = ₦590 1 Month",
          planAmount: 585,
          PRODUCT_AMOUNT: 585,
        },
        
      ],
    },
  ];

  // Added 8% to all prices
  // dataPlans.map(dataPlan => {
  //   dataPlan.plans.map(plan => {
  //     plan.PRODUCT_AMOUNT = (plan.planAmount * 0.08) + plan.planAmount;
  //   });
  // });

  try {
    await JoenatechDataPlan.deleteMany();
    await JoenatechDataPlan.insertMany(dataPlans);
    // await CurrentDate.create({Day: 2, Month: 6, Year: currentYear});
    res.status(200).json({
      message: "Data Plans Inserted",
    });
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error(error.message);
  }
};

const findTransactionsWithSameSenderAndRecipient = async (req, res) => {
  try {
    const transactions = await User.find({
      fullname: /Ogule/,
    });
    res.status(200).json({
      data: transactions,
    });
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error("Error finding transactions:", error.message);
  }
};

module.exports = {
  resetmonthlypv,
  findTransactionsWithSameSenderAndRecipient,
  insertQuery,
  insertDataPlans,
};
