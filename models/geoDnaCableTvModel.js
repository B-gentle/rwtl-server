const mongoose = require("mongoose");

const cablePlanSchema = new mongoose.Schema({
  cableID: {
    type: Number,
    required: true,
  },
  cableName: {
    type: String,
    required: true,
  },
  cableplanID: {
    type: Number,
    required: true,
  },
  cableplanName: {
    type: String,
    required: true,
  },
  cableplanAmount: {
    type: Number,
    required: true,
  },
});

const JoenatechCablePlan = mongoose.model(
  "joenatechCablePlan",
  cablePlanSchema
);

module.exports = JoenatechCablePlan;
