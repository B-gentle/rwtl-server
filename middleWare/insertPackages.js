const mongoose = require("mongoose");
const Package = require("../models/packageModel");

const packages = [
  { name: 'Executive Plantinum', amount: 200000, pv: 400, instantCashBack: 50000, referralBonusLevel: 10, transaction: { level: 6, percentage: 9.5 } },
  { name: 'Plantinum', amount: 100000, pv: 200, instantCashBack: 25000, referralBonusLevel: 9, transaction: { level: 5, percentage: 7.5 } },
  { name: 'Gold', amount: 50000, pv: 100, instantCashBack: 12500, referralBonusLevel: 8, transaction: { level: 4, percentage: 6.5 } },
  { name: 'Silver', amount: 20000, pv: 40, instantCashBack: 5000, referralBonusLevel: 7, transaction: { level: 3, percentage: 5.5 } },
  { name: 'Bronze', amount: 10000, pv: 20, instantCashBack: 2500, referralBonusLevel: 6, transaction: { level: 2, percentage: 4.5 } },
  { name: 'Basic', amount: 5000, pv: 10, instantCashBack: 1250, referralBonusLevel: 5, transaction: { level: 1, percentage: 3.5 } },
];

const insertPackages = async () => {
  try {
    await Package.insertMany(packages);
    console.log('Predefined packages added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error adding predefined packages', error);
    process.exit(1);
  }
};

// const instantCashBackData = [
//   { "level": 1, "bonusPercentage": 0.25 },
//   { "level": 2, "bonusPercentage": 0.06 },
//   { "level": 3, "bonusPercentage": 0.05 },
//   { "level": 4, "bonusPercentage": 0.02 },
//   { "level": 5, "bonusPercentage": 0.015 },
//   { "level": 6, "bonusPercentage": 0.015 },
//   { "level": 7, "bonusPercentage": 0.01 },
//   { "level": 8, "bonusPercentage": 0.01 },
//   { "level": 9, "bonusPercentage": 0.01 },
//   { "level": 10, "bonusPercentage": 0.01 }
//   ]
  
  
//   Package.updateMany({}, { instantCashBack: 0.25})
//     .then(() => {
//       console.log('Instant Cash Back data updated successfully');
//     })
//     .catch((error) => {
//       console.error('Error updating Instant Cash Back data:', error);
//     });

insertPackages();
