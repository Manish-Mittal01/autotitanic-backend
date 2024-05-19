const { Schema, model, Types } = require("mongoose");
const jwt = require("jsonwebtoken");

const staffSchema = Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
    },
    password: {
      type: String,
    },
    birthDate: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    nationality: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: Schema.Types.ObjectId,
      ref: "cities",
      required: true,
    },
    country: {
      type: Schema.Types.ObjectId,
      ref: "countries",
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "roles",
      required: true,
    },
    qualification: {
      type: String,
    },
    employmentStatus: {
      type: String,
    },
    socialSecurityNumber: {
      type: String,
    },
    nextOfKin: {
      type: String,
    },
    relationship: {
      type: String,
    },
    emergencyEmail: {
      type: String,
      required: true,
    },
    emergencyMobile: {
      type: String,
      required: true,
    },
    emergencyCity: {
      type: String,
      ref: "cities",
      required: true,
    },
    emergencyCountry: {
      type: String,
      ref: "countries",
      required: true,
    },
    emergencyAddress: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "deleted", "inactive"],
      default: "inactive",
    },
  },
  { timestamps: true, versionKey: false }
);

staffSchema.methods.generateJWT = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      mobile: this.mobile,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET_KEY
    // { expiresIn: "7d" }
  );
  return token;
};

module.exports = model("staffs", staffSchema);
