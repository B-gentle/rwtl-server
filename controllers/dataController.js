const DataPlan = require("../models/dataPlansModel");
const JoenatechDataPlan = require("../models/joenatechMTNDataModel");
const JoenatechCablePlan = require("../models/geoDnaCableTvModel");
const asyncHandler = require("express-async-handler");
const axios = require("axios");

const getDataPlan = async (req, res) => {
  const { networkCode } = req.body;

  try {
    const response = await axios.get(
      `${process.env.CLUB_KONNECT_URl}/APIDatabundlePlansV2.asp`
    );
    const selectedNetwork = Object.values(response.data.MOBILE_NETWORK).find(
      (network) => network.some((object) => object.ID === networkCode)
    );

    const selectedPlan = selectedNetwork.map((plan) => plan.PRODUCT);
    res.status(200).json({
      data: selectedPlan,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

const getCablePlans = asyncHandler(async (req, res) => {
  const { cableNetwork } = req.body;
  const response = await axios.get(
    `${process.env.CLUB_KONNECT_URl}/APICableTVPackagesV2.asp`
  );

  const selectedCable = Object.values(response.data.TV_ID).find((cable) =>
    cable.some((object) => object.ID === cableNetwork)
  );

  const selectedProducts = selectedCable.map((product) => product.PRODUCT);
  res.status(200).json(selectedProducts);
});

const getDnaCablePlans = asyncHandler(async (req, res) => {
  const { cableNetwork } = req.query;
  const response = await JoenatechCablePlan.find({ cableID: cableNetwork });
  res.status(200).json(response);
});

const getJoeNadPlan = asyncHandler(async (req, res) => {
  const { networkCode } = req.body;
  const plans = await JoenatechDataPlan.find({
    networkId: networkCode,
  });
  if (plans) {
    res.status(200).json(plans);
  } else {
    res.status(400);
    throw new Error("No data plan found");
  }
});

const editDnaDataPrices = asyncHandler(async (req, res) => {
  const { networkId } = req.params;
  const { PRODUCT_ID, planAmount, PRODUCT_AMOUNT, PRODUCT_NAME } = req.body;

  const dataPlan = await JoenatechDataPlan.findOne({ networkId });
  if (!dataPlan) {
    res.status(404);
    throw new Error("Data plan not found");
  }

  const plan = dataPlan.plans.find((plan) => plan.PRODUCT_ID === PRODUCT_ID);

  if (!plan) {
    res.status(404);
    throw new Error("Plan not found");
  }

  plan.planAmount = planAmount;
  plan.PRODUCT_AMOUNT = PRODUCT_AMOUNT;
  plan.PRODUCT_NAME = PRODUCT_NAME;
  const updatedPlan = await dataPlan.save();
  if (updatedPlan) {
    res.status(200).json({ message: "Plan updated successfully" });
  } else {
    res.status(500);
    throw new Error("Internal Server Error");
  }
});

const addDnaDataPrices = asyncHandler(async (req, res) => {
  const { networkId, PRODUCT_ID, planAmount, PRODUCT_AMOUNT, PRODUCT_NAME } = req.body;

  const network = await JoenatechDataPlan.findOne({ networkId });
  if (!network) {
    res.status(404);
    throw new Error("Network not found, please select a valid network!");
  }

  const newPlan = {networkId, PRODUCT_ID, planAmount, PRODUCT_AMOUNT, PRODUCT_NAME}

  network.plans.push(newPlan)

  const addedPlan = await network.save();
  if (addedPlan) {
    res.status(201).json({ message: "Plan added successfully" });
  } else {
    res.status(500);
    throw new Error("Failed to add plan, please try again!");
  }
});

module.exports = {
  getDataPlan,
  getCablePlans,
  getDnaCablePlans,
  getJoeNadPlan,
  editDnaDataPrices,
  addDnaDataPrices
};
