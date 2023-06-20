const Package = require("../models/packageModel");
const User = require("../models/userModel");

const payUplines = async(currentUserUplineId, profit) => {
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
            if (uplinePackage && uplinePackage.transaction && uplinePackage.transaction.level >= generation) {
                const transactionProfit = ((profit * uplinePackage.transaction.percentage) / 100).toFixed(2)
                upline.commissionBalance += parseFloat(transactionProfit);
                upline.withdrawableCommission += parseFloat(transactionProfit);
                await upline.save();
            }
        }

        if (upline && upline.upline && upline.upline.ID) {
            uplineID = upline.upline.ID;
        }
    }
}

module.exports = payUplines