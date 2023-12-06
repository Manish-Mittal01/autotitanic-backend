const { Schema, model } = require("mongoose");
const jwt = require("jsonwebtoken");
const shortid = require("shortid");

const userSchema = Schema(
  {
    userId: {
      type: String,
      default: shortid.generate,
    },
    mobile: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "active",
    },
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: ["private", "dealer"],
      required: true,
    },
    country: {
      type: String,
      required: true,
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

userSchema.methods.generateJWT = () => {
  const token = jwt.sign(
    {
      _id: this._id,
      mobile: this.mobile,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  );
  return token;
};

module.exports = model("users", userSchema);
