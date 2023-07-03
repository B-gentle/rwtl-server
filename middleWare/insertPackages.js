const mongoose = require("mongoose");
const Package = require("../models/packageModel");

const packages = [
  { name: 'Executive Platinum', amount: 200000, pv: 400, instantCashBack: 50000, referralBonusLevel: 10, transaction: { level: 6, percentage: 9.5 } },
  { name: 'Platinum', amount: 100000, pv: 200, instantCashBack: 25000, referralBonusLevel: 9, transaction: { level: 5, percentage: 7.5 } },
  { name: 'Gold', amount: 50000, pv: 100, instantCashBack: 12500, referralBonusLevel: 8, transaction: { level: 4, percentage: 6.5 } },
  { name: 'Silver', amount: 20000, pv: 40, instantCashBack: 5000, referralBonusLevel: 7, transaction: { level: 3, percentage: 5.5 } },
  { name: 'Bronze', amount: 10000, pv: 20, instantCashBack: 2500, referralBonusLevel: 6, transaction: { level: 2, percentage: 4.5 } },
  { name: 'Basic', amount: 5000, pv: 10, instantCashBack: 1250, referralBonusLevel: 5, transaction: { level: 1, percentage: 3.5 } },
];

// const incentives = [
//   {
//     incentiveName: 'Laptop and 300k',
//   requiredPv: 25000,
//   description: 'First Leadership Incentive',
//   },
//   {
//     incentiveName: 'Family Trip Award',
//   requiredPv: 60000,
//   description: 'Second Leadership Incentive',
//   },

//   {
//     incentiveName: 'Small Car Fund',
//     requiredPv: 100000,
//     description: 'Third Leadership Incentive',
//   },

//   {
//     incentiveName: 'Big Car Award',
//     requiredPv: 250000,
//     description: 'Fourth Leadership Incentive',
//   },

//   {
//     incentiveName: 'First House Fund',
//     requiredPv: 500000,
//     description: 'Fifth Leadership Incentive',
//   },

//   {
//     incentiveName: 'Second House Fund',
//     requiredPv: 1000000,
//     description: 'Sixth Leadership Incentive',
//   },

//   {
//     incentiveName: 'Leadership Bonus',
//     requiredPv: 10000,
//     description: 'monthly Leadership Incentive',
//   },

// ]

// Incentives.insertMany(incentives)
//   .then((result) => {
//     console.log('Incentives created successfully:', result);
//   })
//   .catch((error) => {
//     console.error('Error creating incentives:', error);
//   });


// const instantCashBackData = [
//   { "level": 1, "bonusPercentage": 0.25 },
//   { "level": 2, "bonusPercentage": 0.04 },
//   { "level": 3, "bonusPercentage": 0.03 },
//   { "level": 4, "bonusPercentage": 0.02 },
//   { "level": 5, "bonusPercentage": 0.015 },
//   { "level": 6, "bonusPercentage": 0.01 },
//   { "level": 7, "bonusPercentage": 0.01 },
//   { "level": 8, "bonusPercentage": 0.01 },
//   { "level": 9, "bonusPercentage": 0.01 },
//   { "level": 10, "bonusPercentage": 0.01 }
//   ]
  
  
// Package.updateMany({}, { instantCashBack: instantCashBackData})
//     .then(() => {
//       console.log('name update successful');
//     })
//     .catch((error) => {
//       console.error('Error updating name:', error);
//     });

insertPackages();
