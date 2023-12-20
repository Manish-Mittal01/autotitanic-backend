const { Schema, model } = require("mongoose");

const countrySchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    flag: {
      type: String,
      required: true,
    },
    countryCode: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    cities: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("countries", countrySchema);
