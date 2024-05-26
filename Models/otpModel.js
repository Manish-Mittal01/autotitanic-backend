const { Schema, model } = require("mongoose");

const otpSchema = Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: {
        expires: "24h",
      },
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("otps", otpSchema);
