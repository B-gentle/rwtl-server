const Package = require("../models/packageModel");
const User = require("../models/userModel");

const calculateUplineBonuses = async (uplineID, packageID, pv) => {
    try {
        let upline = await User.findById(uplineID);
        let userLevel = 1
        //pay referral bonus
            const userPackage = await Package.findById(packageID);

            if (upline && upline.package && upline.package.ID) {
                const uplinePackage = await Package.findById(upline.package.ID);
                const referralBonuses = uplinePackage.uplineBonuses

                for (const bonus of referralBonuses) {
                    const {
                        bonusPercentage
                    } = bonus;
                    if (userLevel <= uplinePackage.referralBonusLevel) {
                        const referralBonus = userPackage?.amount * bonusPercentage;
                        upline.withdrawableCommission += referralBonus;
                        upline.commissionBalance += referralBonus;
                        if (userLevel === 1) {
                            upline.directPv += pv
                            upline.monthlyPv += pv
                        } else if(userLevel >= 2 && userLevel <= 5){
                            upline.indirectPv += 0.5 * pv
                            upline.monthlyPv +=  0.5 * pv
                        }else if(userLevel >= 6 && userLevel <= 10){
                            upline.monthlyPv +=  0.25 * pv
                            upline.indirectPv += 0.25 * pv
                        }
                        upline.pv = upline.indirectPv + upline.directPv + uplinePackage.pv
                        await upline.save();
                    }else{
                        console.log('error here')
                    }

                    if (upline && upline.upline && upline.upline.ID) {
                        upline = await User.findById(upline.upline.ID);
                        userLevel += 1;
                    }
                }
            }else{
                console.log('bonus not paid')
            }
            

    } catch (error) {
console.log(error)
    }

}

module.exports = calculateUplineBonuses