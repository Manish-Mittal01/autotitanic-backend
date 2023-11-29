const { Schema, model } = require("mongoose");

const brandSchema = Schema({
  label: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  vehicleType: {
    type: [{ type: String }],
    default: [],
  },
});

module.exports = model("brands", brandSchema);
