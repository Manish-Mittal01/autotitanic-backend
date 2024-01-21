const { Schema, model } = require("mongoose");

const vehicleSchema = Schema(
  {
    accelration: {
      type: String,
    },
    bodyStyle: {
      type: String,
    },
    bootSpace: {
      type: String,
    },
    condition: {
      type: String,
      required: true,
    },
    co2Emission: {
      type: String,
    },
    country: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "countries",
    },
    city: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "cities",
    },
    currency: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    door: {
      type: Number,
    },
    driverPosition: {
      type: String,
    },
    engineSize: {
      type: String,
    },
    exteriorColor: {
      type: String,
    },
    fuelType: {
      type: String,
    },
    // fuelConsumption: {
    //   type: String,
    // },
    gearBox: {
      type: String,
    },
    interiorColor: {
      type: String,
    },
    isFeatured: {
      type: Boolean,
      required: true,
      default: false,
    },
    kmDriven: {
      type: String,
    },
    make: {
      type: Schema.Types.ObjectId,
      ref: "makes",
    },
    media: {
      type: [{ url: String, type: { type: String } }],
      required: true,
      default: [],
    },
    model: {
      type: Schema.Types.ObjectId,
      ref: "models",
    },
    mileage: {
      type: Number,
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: String,
    },
    reviews: {
      type: [{ type: String }],
      default: [],
    },
    seat: {
      type: String,
    },
    // vehicle type
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    variant: {
      type: Schema.Types.ObjectId,
      ref: "variants",
    },
    year: {
      type: Number,
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = model("vehicles", vehicleSchema);
