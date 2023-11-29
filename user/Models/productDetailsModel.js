import { Schema } from "mongoose";

const productSchema = Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  carCondition: {
    type: String,
    required: true,
  },
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  bodyStyle: {
    type: String,
    required: true,
  },
  gearBox: {
    type: String,
    required: true,
  },
  engineSize: {
    type: String,
    required: true,
  },
  fuelConsumption: {
    type: String,
    required: true,
  },
  fuelType: {
    type: String,
    required: true,
  },
  mileage: {
    type: String,
    required: true,
  },
  exteriorColor: {
    type: String,
    required: true,
  },
  interiorColor: {
    type: String,
    required: true,
  },
  actual_price: {
    type: String,
    required: true,
  },
  discount: {
    type: String,
    required: true,
  },
  final_price: {
    type: String,
    required: true,
  },
  variants_id: {
    type: String,
    required: true,
  },
  rating: {
    type: String,
    required: true,
  },
  variants: {
    type: [{ size: String }],
    default: [],
  },
  reviews: {
    type: [{ type: String }],
    default: [],
  },
  inStock: {
    type: Boolean,
    required: true,
    default: true,
  },
});
