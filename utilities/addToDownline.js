const User = require("../models/userModel")
const Package = require("../models/packageModel");

const addToDownline = async (username, uplineID, userId,  packageName, userPv) => {
    try {
        // add user to upline's downline
        let upline = await User.findById(uplineID);
        let level = 1

        while (upline) {
            if (!upline) {
                break;
            }
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