const asyncHandler = require("express-async-handler");
const Package = require("../models/packageModel");

const addPackage = async (req, res) => {
res.send("ok");
}

const getPackages = async (req, res) => {
    try {
        const packages = await Package.find();
        if (packages){
            res.status(200).json({data: packages})
        }
    } catch (error) {
        res.status(400)
        throw new Error(error)
    }
}

const getUpgradePackages = async(req, res) => {
    try {
        const currentUserPackage = await Package.findById(req.user.package.ID)
        const packages = await Package.find();
        const higherAmountPackage = packages.filter((pkg) => pkg.amount > currentUserPackage.amount);
        if (higherAmountPackage){
            res.status(200).json({data: higherAmountPackage})
        }
    } catch (error) {
        res.status(400)
        throw new Error(error)
    }
}

const upgradePackage = async(req, res) => {
    const {package} = req.body
}

module.exports = { addPackage, getPackages, getUpgradePackages }