const DataPlan = require("../models/dataPlansModel");

const getDataPlan = async (req, res) => {
    try {
        const dataPlan = await DataPlan.find();
        if (dataPlan){
            res.status(200).json({data: dataPlan})
        }
    } catch (error) {
        res.status(400)
        throw new Error(error)
    }
}

module.exports = getDataPlan