const mongoose = require('mongoose');

const IncentiveNames = Object.freeze({
    Incentive1: 'Leadership Bonus',
    Incentive2: 'Laptop and 300k',
    Incentive3: 'Family Trip Award',
    Incentive4: 'Small Car Fund',
    Incentive5: 'Big Car Award',
    Incentive6: 'First House Fund Award',
    Incentive7: 'Second House Fund Award',
    // Add more incentives as needed
  });

const incentivesSchema = new mongoose.Schema({
  incentiveName: {
    type: String,
    required: true,
  },

  requiredPv:{
      type: Number,
      required: true
  },
  
});

const Incentives = mongoose.model('Incentives', incentivesSchema);

module.exports = Incentives;
