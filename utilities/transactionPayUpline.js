const Package = require("../models/packageModel");
const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");

const payUplines = async (currentUserUplineId, amount, transactionId, network, phoneNumber) => {
    try {

        let uplineID = currentUserUplineId;
        let earningLimit = 7;

        for (let i = 1; i <= earningLimit; i++) {
            let generation = i
            if (!uplineID) {
                break; // Break the loop if the user or their up-liner doesn't exist
            }
            const upline = await User.findById(uplineID); //some DB call to fetch the user by id
            if (upline && upline.package && upline.package.ID) {
                const uplinePackage = await Package.findById(upline.package.ID);
                if (uplinePackage && uplinePackage.transaction) {
                    const transactionProfit = (amount * uplinePackage.transaction.percentage).toFixed(2)
                    upline.commissionBalance += parseFloat(transactionProfit);
                    upline.withdrawableCommission += parseFloat(transactionProfit);
                    await upline.save();

                    const transaction = new Transaction({
                        transactionId,
                        transactionType: 'commission',
                        commission: parseFloat(transactionProfit),
                        network: network ? network : 'NA',
                        phoneNumber: phoneNumber ? phoneNumber : 'NA',
                        prevCommissionBalance: upline.withdrawableCommission - parseFloat(transactionProfit),
                        newCommissionBalance: upline.withdrawableCommission,
                        amount,
                        user: upline
                    })

                    await transaction.save();
                }
            }

            if (upline && upline.upline && upline.upline.ID) {
                uplineID = upline.upline.ID;
            } else {
                break;
            }
        }
    } catch (error) {
        console.log(error)
        throw new Error(error.message)  
    }
}

const payUtilityUplines = async ( currentUserUplineId, amount, transactionId, number, company, cat) => {
    try {

        let uplineID = currentUserUplineId;
        let earningLimit = 7;

        for (let i = 1; i <= earningLimit; i++) {
            let generation = i
            if (!uplineID) {
                break; // Break the loop if the user or their up-liner doesn't exist
            }
            const upline = await User.findById(uplineID); //some DB call to fetch the user by id
            if (upline && upline.package && upline.package.ID) {
                const uplinePackage = await Package.findById(upline.package.ID);
                if (uplinePackage && uplinePackage.transaction) {
                    const transactionProfit = 10
                    upline.commissionBalance += transactionProfit;
                    upline.withdrawableCommission += transactionProfit;
                    await upline.save();

                    const transaction = new Transaction({
                        transactionId,
                        transactionType: 'commission',
                        commission: parseFloat(transactionProfit),
                        IUC: cat === 'cable' ? number : 'NA',
                        meterNo: cat === 'electricity' ?  number : 'NA',
                        transactionCategory: cat,
                        cableCompany: cat === 'cable' ? company : 'NA',
                        ElectricCompany: cat === 'electricity' ? company : 'NA',
                        prevCommissionBalance: upline.withdrawableCommission - transactionProfit,
                        newCommissionBalance: upline.withdrawableCommission,
                        amount,
                        user: upline
                    })

                    await transaction.save();
                }
            }

            if (upline && upline.upline && upline.upline.ID) {
                uplineID = upline.upline.ID;
            } else {
                break;
            }
        }
    } catch (error) {
        console.log(error)
        throw new Error(error.message)  
    }
}

module.exports = { payUplines, payUtilityUplines }