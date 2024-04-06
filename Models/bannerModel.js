const { Schema, model } = require("mongoose");

const bannerSchema = Schema(
  {
    title: {
      type: String,
      required: true,
    },
    bannerImage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("banners", bannerSchema);
