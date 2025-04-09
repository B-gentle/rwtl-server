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
  const { id, PRODUCT_ID, planAmount, PRODUCT_AMOUNT, PRODUCT_NAME } = req.body;

  const dataPlan = await JoenatechDataPlan.findOne({ networkId });
  if (!dataPlan) {
    res.status(404);
    throw new Error("Data plan not found");
  }

  const plan = dataPlan.plans.find((plan) => plan._id.toString() === id);

  if (!plan) {
    res.status(404);
    throw new Error("Plan not found");
  }

  plan.PRODUCT_ID = PRODUCT_ID || plan.PRODUCT_ID;
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
  const { networkId, PRODUCT_ID, planAmount, PRODUCT_AMOUNT, PRODUCT_NAME } =
    req.body;

  const network = await JoenatechDataPlan.findOne({ networkId });
  if (!network) {
    res.status(404);
    throw new Error("Network not found, please select a valid network!");
  }

  const newPlan = {
    networkId,
    PRODUCT_ID,
    planAmount,
    PRODUCT_AMOUNT,
    PRODUCT_NAME,
  };

  network.plans.push(newPlan);

  const addedPlan = await network.save();
  if (addedPlan) {
    res.status(201).json({ message: "Plan added successfully" });
  } else {
    res.status(500);
    throw new Error("Failed to add plan, please try again!");
  }
});

const getJoeNadCablePlan = asyncHandler(async (req, res) => {
  const { cableNetwork } = req.body;
  const plans = await JoenatechCablePlan.find({
    cableName: cableNetwork,
  });
  if (plans) {
    res.status(200).json(plans);
  } else {
    res.status(400);
    throw new Error("No data plan found");
  }
});

const editDnaCablePrices = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { cableplanID, cableplanAmount, cableplanName, cableName } = req.body;

  const plan = await JoenatechCablePlan.findById(id);
  if (!plan) {
    res.status(404);
    throw new Error("Cable plan not found");
  }

  plan.cableplanID = cableplanID || plan.cableplanID;
  plan.cableplanAmount = cableplanAmount || plan.cableplanAmount;
  plan.cableplanName = cableplanName || plan.cableplanName;
  plan.cableName = cableName || plan.cableName;
  const updatedPlan = await plan.save();
  if (updatedPlan) {
    res.status(200).json({ message: "Plan updated successfully" });
  } else {
    res.status(500);
    throw new Error("Internal Server Error");
  }
});

const deleteDnaDataPlan = asyncHandler(async (req, res) => {
  const { networkId, id } = req.body;

  const dataPlan = await JoenatechDataPlan.findOneAndUpdate(
    { networkId },
    { $pull: { plans: { _id: id } } },
    { new: true }
  );
  if (!dataPlan) {
    res.status(404);
    throw new Error("Data plan not found");
  }

  const planDeleted = dataPlan.plans.some(
    (plan) => plan._id?.toString() === id
  );
  console.log(planDeleted);
  if (!planDeleted) {
    res.status(200).json({ message: "Plan deleted successfully" });
  } else {
    res.status(404);
    throw new Error("Plan not found in the network.");
  }
});

const deleteDnaCablePlan = asyncHandler(async (req, res) => {
  const { id } = req.body;

  const cablePlan = await JoenatechCablePlan.findById(id);

  if (cablePlan) {
    await cablePlan.deleteOne();
    res.status(200).json({ message: "Plan deleted Successfully" });
  } else {
    res.status(404);
    throw new Error("Cable plan not found");
  }
});

const addDnaCablePlan = asyncHandler(async (req, res) => {
  const { cableName, cableplanID, cableplanName, cableplanAmount, cableID } =
    req.body;

  if (
    !cableName ||
    !cableplanID ||
    !cableplanName ||
    !cableplanAmount ||
    !cableID
  ) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  const plan = await JoenatechCablePlan.create({
    cableName,
    cableplanID,
    cableplanName,
    cableplanAmount,
    cableID,
  });

  if (plan) {
    res.status(201).json({ message: "Plan added successfully" });
  } else {
    res.status(500);
    throw new Error("Internal Server error, please try again!");
  }
});

module.exports = {
  getDataPlan,
  getCablePlans,
  getDnaCablePlans,
  getJoeNadPlan,
  editDnaDataPrices,
  addDnaDataPrices,
  getJoeNadCablePlan,
  editDnaCablePrices,
  deleteDnaDataPlan,
  deleteDnaCablePlan,
  addDnaCablePlan,
};
