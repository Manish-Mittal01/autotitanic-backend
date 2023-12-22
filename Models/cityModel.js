const { Schema, model } = require("mongoose");

const citySchema = Schema(
  {
    country: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "countries",
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("cities", citySchema);
