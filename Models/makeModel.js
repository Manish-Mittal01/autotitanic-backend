const { Schema, model } = require("mongoose");

const makeSchema = Schema(
  {
    label: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    type: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("makes", makeSchema);
