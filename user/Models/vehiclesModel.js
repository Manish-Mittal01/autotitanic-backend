const { Schema, model } = require("mongoose");

const vehicleSchema = Schema({
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
    type: String,
    required: true,
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
  fuelConsumption: {
    type: String,
  },
  gearBox: {
    type: String,
  },
  interiorColor: {
    type: String,
  },
  kmDriven: {
    type: String,
  },
  make: {
    type: String,
  },
  media: {
    type: [String],
    required: true,
  },
  model: {
    type: String,
  },
  mileage: {
    type: String,
  },
  price: {
    type: String,
    required: true,
  },

  rating: {
    type: String,
  },
  reviews: {
    type: [{ type: String }],
    default: [],
  },
  state: {
    type: String,
    required: true,
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
  userId: {
    type: String,
    // required: true,
  },
  year: {
    type: String,
  },
});

module.exports = model("vehicles", vehicleSchema);
