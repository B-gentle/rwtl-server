const Package = require("../models/packageModel");
const User = require("../models/userModel");

const calculateUplineBonuses = async (uplineID, packageID) => {
    try {
        let upline = await User.findById(uplineID);
        let userLevel = 1
        //pay referral bonus
        while (upline) {

            if (!upline) {
                break;
            }

            const userPackage = await Package.findById(packageID);

            if (upline && (upline.package) && upline.package.ID) {
                const uplinePackage = await Package.findById(upline.package.ID);
                const referralBonuses = uplinePackage.uplineBonuses

                for (const bonus of referralBonuses) {
                    const {
                        level,
                        bonusPercentage
                    } = bonus;

                    if (level <= uplinePackage.referralBonusLevel) {
                        const referralBonus = userPackage?.amount * bonusPercentage;
                        console.log('referralBonus:', referralBonus)
                        upline.withdrawableCommission += referralBonus;
                        upline.commissionBalance += referralBonus;
                        upline.pv += uplinePackage.pv
                        if (userLevel === 1) {
                            upline.directPv += uplinePackage.pv
                        } else {
                            upline.indirectPv += uplinePackage.pv
                        }
                        await upline.save();
                    }else{
                        console.log('error here')
                    }
                }
            }else{
                console.log('bonus not paid')
            }
            if (upline && upline.upline && upline.upline.ID) {
                upline = await User.findById(upline.upline.ID);
                userLevel++;
                if (!upline) {
                    break;
                }
            }
        }

    } catch (error) {
console.log(error)
    }

}

module.exports = calculateUplineBonuses