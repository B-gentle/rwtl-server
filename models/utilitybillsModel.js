const mongoose = require('mongoose');

const utilityBillsSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
  },

  providerCode:{
      type: String,
      required: true
  },
  
  plans: [
    {
      productCode: {
        type: String,
        required: true,
      },
      productName: {
        type: String,
        required: true,
      },
      productAmount: {
        type: String,
        required: true,
      },
      companyPrice: {
        type: Number,
        required: true,
      },
      difference: {
        type: Number,
        required: true,
      },
    },
  ],
});

const DataPlan = mongoose.model('DataPlan', dataPlanSchema);

module.exports = DataPlan;
