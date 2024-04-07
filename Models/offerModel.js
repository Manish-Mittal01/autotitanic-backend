const { Schema, model } = require("mongoose");

const offerSchema = Schema(
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
    offer: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("offers", offerSchema);
