const User = require("../models/userModel")
const Package = require("../models/packageModel");

const addToDownline = async (username, uplineID, userId, packageID, packageName, userPv) => {
    try {
        // add user to upline's downline
        let upline = await User.findById(uplineID);
        console.log("run")
        let level = 1

        while (upline) {
            // Create a new downline object
            const downline = {
                userId,
                username,
                level,
                pv: userPv,
                package: {
                    name: packageName
                },
            };
            // Push the downline to the upline's downlines array
            upline?.downlines.push(downline);
            await upline.save();
            //pay referral bonus
            const userPackage = await Package.findById(packageID);
            if (upline && upline.package && upline.package.ID) {

                const uplinePackage = await Package.findById(upline.package.ID);
                const instantCashBack = uplinePackage.instantCashBack;

                for (const cashBack of instantCashBack) {
                    const {
                        level,
                        bonusPercentage
                    } = cashBack;
                    console.log(upline) 
                    if (level <= upline.referralBonusLevel) {
                        console.log(level);
                        const referralBonus = userPackage?.amount * bonusPercentage;
                        console.log('referralBonus:',referralBonus)
                        upline.withdrawableCommission += referralBonus;
                        upline.commissionBalance += referralBonus;
                        upline.pv += uplinePackage.pv
                        console.log(`Paid referral bonus of ${referralBonus} to upline at level ${level}`);
                        await upline.save();
                    }

                }
            }
            if (upline && upline.upline && upline.upline.ID) {
                upline = await User.findById(upline.upline.ID);
                level++;
                if (!upline) {
                    break;
                }
            }
        }

    } catch (err) {
        console.log(err)
    }
}

module.exports = addToDownline;