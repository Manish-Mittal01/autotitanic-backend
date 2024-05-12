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
    birthDate: {
      type: String,
      required: true,
    },
    nationality: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: Types.ObjectId,
      required: true,
      ref: "countries",
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
    },
    emergencyMobile: {
      type: String,
    },
    emergencyCity: {
      type: String,
    },
    emergencyCountry: {
      type: String,
    },
    emergencyAddress: {
      type: String,
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
