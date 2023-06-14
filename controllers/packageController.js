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

module.exports = { addPackage, getPackages }