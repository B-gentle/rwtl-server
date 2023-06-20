const DataPlan = require("../models/dataPlansModel");
const asyncHandler = require("express-async-handler");
const axios = require('axios')

const getDataPlan = async (req, res) => {
    const {
        networkCode
    } = req.body
    try {
        const dataPlan = await DataPlan.find({
            networkCode
        });
        if (dataPlan) {
            res.status(200).json({
                data: dataPlan
            })
        }
    } catch (error) {
        res.status(400)
        throw new Error(error)
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
    res.status(200).json({
        data: selectedProducts
    })

})

const getElectricityCompany = asyncHandler(async (req, res) => {
    const {
        cableNetwork
    } = req.body;
    const response = await axios.get(`${process.env.CLUB_KONNECT_URl}/APIElectricityDiscosV1.asp`);

    const selectedCable = Object.values(response.data.TV_ID).find((cable) =>
        cable.some((object) => object.ID === cableNetwork)
    );
    const selectedProducts = selectedCable.map((product) => product.PRODUCT);
    res.status(200).json({
        data: selectedProducts
    })

})

module.exports = {
    getDataPlan,
    getCablePlans,
    getElectricityCompany
}