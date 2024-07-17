const { Schema, model } = require("mongoose");
const fs = require("fs");
const cron = require("node-cron");
const path = require("path");

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
      type: [{ url: String, type: { type: String }, filename: String }],
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

const vehicleModel = model("vehicles", vehicleSchema);

let cleanupTaskRunning = false;

async function cleanupExpiredDocuments() {
  if (cleanupTaskRunning) {
    console.log("Cleanup task is already running. Skipping this execution.");
    return;
  }
  cleanupTaskRunning = true;
  const sixMonth = 6 * 30 * 24 * 60 * 60;

  try {
    const expiredDocs = await vehicleModel.find({
      createdAt: { $lt: new Date(Date.now() - sixMonth) }, // Find documents older than 6 months
    });

    for (const doc of expiredDocs) {
      for (const image of doc.images) {
        try {
          const delFiles = await fs.promises.unlink(
            path.join(__dirname, "..", "public", "assets", image.filename)
          );
          const deletedDoc = await vehicleModel.deleteOne({
            _id: doc._id,
          });
        } catch (err) {
          console.log("err deleting file", err);
        }
      }
    }
  } catch (error) {
    console.error("Error cleaning up expired documents:", error);
    cleanupTaskRunning = false;
  } finally {
    cleanupTaskRunning = false;
  }
}

// Schedule the cleanup job to run every day
cron.schedule("0 0 * * *", cleanupExpiredDocuments);

module.exports = vehicleModel;
