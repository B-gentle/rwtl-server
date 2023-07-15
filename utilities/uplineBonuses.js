const Package = require("../models/packageModel");
const User = require("../models/userModel");
const Transaction = require("../models/transactionModel");

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
                        let dpv;
                        let idpv;
                        if (userLevel === 1) {
                            upline.directPv += pv
                            dpv = pv
                            idpv = 0
                            upline.monthlyPv += pv
                        } else if(userLevel >= 2 && userLevel <= 5){
                            upline.indirectPv += 0.5 * pv
                            dpv = 0
                            idpv = 0.5 * pv
                            upline.monthlyPv +=  0.5 * pv
                        }else if(userLevel >= 6 && userLevel <= 10){
                            upline.monthlyPv +=  0.25 * pv
                            upline.indirectPv += 0.25 * pv
                            idpv = 0.25 * pv
                            dpv = 0
                        }
                        upline.pv += idpv + dpv;
                        await upline.save();
                    }else{
                        console.log('error here')
                    }

                    if (upline && upline.upline && upline.upline.ID) {
                        upline = await User.findById(upline.upline.ID);
                        userLevel += 1;
                    }else{
                        break;
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