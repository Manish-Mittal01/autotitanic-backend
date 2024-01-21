const { Schema, model } = require("mongoose");

const wishlistSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "vehicles",
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("wishlist", wishlistSchema);
