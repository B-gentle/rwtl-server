const DataPlan = require("../models/dataPlansModel");
const JoenatechDataPlan = require("../models/joenatechMTNDataModel");
const asyncHandler = require("express-async-handler");
const axios = require('axios')

const getDataPlan = async (req, res) => {
    const {
        networkCode
    } = req.body

    try {
        const response = await axios.get(`${process.env.CLUB_KONNECT_URl}/APIDatabundlePlansV2.asp`);
        const selectedNetwork = Object.values(response.data.MOBILE_NETWORK).find((network) =>
            network.some((object) => object.ID === networkCode)
        );

        const selectedPlan = selectedNetwork.map((plan) => plan.PRODUCT);
        res.status(200).json({
            data: selectedPlan
        })
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
}

const getCablePlans = asyncHandler(async (req, res) => {
    const {
        cableNetwork
    } = req.body;
    const response = await axios.get(`${process.env.CLUB_KONNECT_URl}/APICableTVPackagesV2.asp`);

    const selectedCable = Object.values(response.data.TV_ID).find((cable) =>
        cable.some((object) => object.ID === cableNetwork)
    );

    const selectedProducts = selectedCable.map((product) => product.PRODUCT);
    res.status(200).json(selectedProducts)

})

const getJoeNadPlan = asyncHandler(async (req, res) => {
    const {networkCode} = req.body
    const plans = await JoenatechDataPlan.find({
        networkId: networkCode
    })
    if (plans) {
        res.status(200).json(plans)
    } else {
        res.status(400)
        throw new Error("No data plan found")
    }
})


module.exports = {
    getDataPlan,
    getCablePlans,
    getJoeNadPlan
}