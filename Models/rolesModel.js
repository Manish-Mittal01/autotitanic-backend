const { Schema, model } = require("mongoose");

const roleSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("roles", roleSchema);
