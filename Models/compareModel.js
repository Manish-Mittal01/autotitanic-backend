const { Schema, model } = require("mongoose");

const compareSchema = Schema(
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

module.exports = model("compares", compareSchema);
