const { Schema, model } = require("mongoose");

const modelSchema = Schema(
  {
    label: {
      type: String,
      required: true,
    },
    make: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "makes",
    },
    type: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("models", modelSchema);
