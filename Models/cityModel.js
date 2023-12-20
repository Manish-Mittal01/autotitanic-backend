const { Schema, model } = require("mongoose");

const citySchema = Schema(
  {
    countryId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("cities", citySchema);
