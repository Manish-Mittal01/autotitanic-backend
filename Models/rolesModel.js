const { Schema, model } = require("mongoose");

const roleSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    permissions: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("roles", roleSchema);
