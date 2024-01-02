const { Schema, model } = require("mongoose");

const contentPagesSchema = Schema(
  {
    page: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("contentPages", contentPagesSchema);
