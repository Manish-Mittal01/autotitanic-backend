const { Schema, model, Types } = require("mongoose");

const reviewSchema = Schema(
  {
    user: {
      type: Types.ObjectId,
      required: true,
      ref: "users",
    },
    seller: {
      type: Types.ObjectId,
      required: true,
      ref: "users",
    },
    rating: {
      type: String,
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("review", reviewSchema);
