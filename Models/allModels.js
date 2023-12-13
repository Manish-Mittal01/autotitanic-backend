const { Schema, model } = require("mongoose");

const modelSchema = Schema(
  {
    label: {
      type: String,
      required: true,
    },
    makeId: {
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

module.exports = model("models", modelSchema);
