const { Schema, model } = require("mongoose");

const variantSchema = Schema(
  {
    label: {
      type: String,
      required: true,
    },
    model: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "models",
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("variants", variantSchema);
