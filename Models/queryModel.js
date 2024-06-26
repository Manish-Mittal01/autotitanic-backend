const { Schema, model } = require("mongoose");

const querySchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    file: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
    replies: {
      type: [{ title: String, body: String }],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("query", querySchema);
