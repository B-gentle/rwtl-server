const mongoose = require("mongoose");

const joenatechDataPlanSchema = new mongoose.Schema({
    network: {
      type: String,
      required: true,
    },
  
    networkId: {
      type: Number,
      required: true,
    },
  
    plans: [
      {
        PRODUCT_ID: {
          type: Number,
          required: true,
        },
        PRODUCT_NAME: {
          type: String,
          required: true,
        },
        planAmount: {
          type: Number,
          required: true
        },
        PRODUCT_AMOUNT: {
          type: Number,
          required: true,
        },
      },
    ],
  });
  
  const JoenatechDataPlan = mongoose.model("joenatechDataPlan", joenatechDataPlanSchema );

  module.exports = JoenatechDataPlan;