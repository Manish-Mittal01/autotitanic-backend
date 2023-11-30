const { Schema, model } = require("mongoose");

const allModels = Schema({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  brandId: {
    type: String,
    required: true,
  },
  vehicleType: {
    type: [String],
    default: [],
  },
});

module.exports = model("brands", allModels);
