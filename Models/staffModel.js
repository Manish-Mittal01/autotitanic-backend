const { Schema, model, Types } = require("mongoose");
const jwt = require("jsonwebtoken");

const staffSchema = Schema(
  {
    mobile: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["inactive", "active", "blocked"],
      default: "inactive",
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: ["private", "dealer", "admin"],
      required: true,
    },
    country: {
      type: Types.ObjectId,
      required: true,
      ref: "countries",
    },
    dealerLogo: {
      type: String,
    },
    userAvatar: {
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
      userType: this.userType,
    },
    process.env.JWT_SECRET_KEY
    // { expiresIn: "7d" }
  );
  return token;
};

module.exports = model("staffs", staffSchema);
