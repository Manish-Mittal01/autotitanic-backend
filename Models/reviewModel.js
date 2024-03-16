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
    },
    reviews: {
      type: [{ type: String }],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("review", reviewSchema);
