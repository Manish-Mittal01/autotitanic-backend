const { Schema, model } = require("mongoose");

const vehicleSchema = Schema(
  {
    accelration: {
      type: String,
    },
    axle: {
      type: String,
    },
    bedroomLayout: {
      type: String,
    },
    birth: {
      type: Number,
    },
    bodyStyle: {
      type: String,
    },
    bootSpace: {
      type: String,
    },
    cabType: {
      type: String,
    },
    category: {
      type: String,
    },
    condition: {
      type: String,
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
      // required: true,
    },
    door: {
      type: Number,
    },
    driverPosition: {
      type: String,
    },
    endLayout: {
      type: String,
    },
    engineSize: {
      type: String,
    },
    enginePower: {
      type: Number,
    },
    exteriorColor: {
      type: String,
    },
    farmsUsedHours: {
      type: Number,
    },
    fuelType: {
      type: String,
    },
    fuelConsumption: {
      type: String,
    },
    gearBox: {
      type: String,
    },
    gtw: {
      type: Number,
    },
    gvw: {
      type: Number,
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
    length: {
      type: Number,
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
    mileage: {
      type: Number,
    },
    model: {
      type: Schema.Types.ObjectId,
      ref: "models",
    },
    mtplm: {
      type: Number,
    },
    price: {
      type: Number,
      // required: true,
    },
    priceType: {
      type: String,
    },
    seat: {
      type: Number,
    },
    sellOrRent: {
      type: String,
      required: true,
      default: "sell",
      enum: ["sell", "rent"],
    },
    status: {
      type: String,
      required: true,
      default: "pending",
      enum: ["pending", "approved", "rejected", "deleted", "draft"],
    },
    subCategory: {
      type: String,
    },

    // vehicle type
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      // required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    // variant: {
    //   type: Schema.Types.ObjectId,
    //   ref: "variants",
    // },
    wheelBase: {
      type: String,
    },
    year: {
      type: Number,
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = model("vehicles", vehicleSchema);
