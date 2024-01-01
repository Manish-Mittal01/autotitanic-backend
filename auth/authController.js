const UserModel = require("../Models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { StatusCode } = require("../common/Constants");
const { ResponseService } = require("../common/responseService");
const { checkRequiredFields } = require("../common/utility");
const { success } = require("../common/Constants").Status;

module.exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      userType,
      country,
      countryCode,
      mobile,
      password,
      dealerLogo,
      userAvatar,
    } = req.body;

    const validationError = checkRequiredFields({
      name,
      email,
      userType,
      country,
      mobile,
      countryCode,
      password,
    });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const userExist = await UserModel.findOne({ email });

    if (userExist)
      return ResponseService.failed(
        res,
        "User already exist with email",
        StatusCode.forbidden
      );

    const newUser = {
      name,
      email,
      userType,
      country,
      mobile,
      countryCode,
      password,
      dealerLogo,
      userAvatar,
    };
    const user = new UserModel(newUser);

    const salt = await bcrypt.genSalt(8);
    const encryptPassword = await bcrypt.hash(password, salt);
    user.password = encryptPassword;

    let result = await user.save();

    return ResponseService.success(res, "User registered successfully", result);
  } catch (error) {
    console.log("error", error?.message);
    return ResponseService.failed(res, error.message || error);
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const validationError = checkRequiredFields({ email, password });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    if (password && typeof password !== "string")
      return ResponseService.failed(
        res,
        "Password must be string",
        StatusCode.badRequest
      );

    const user = await UserModel.findOne({ email });

    if (!user)
      return ResponseService.failed(res, "User not Found", StatusCode.notFound);
    if (user.status === "blocked")
      return ResponseService.failed(
        res,
        "User is blocked",
        StatusCode.unauthorized
      );

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (user.email === email && isPasswordCorrect) {
      const token = user.generateJWT();

      return ResponseService.success(res, "Login Successful", { token });
    } else {
      return ResponseService.failed(
        res,
        "Incorrect Email or Password",
        StatusCode.unauthorized
      );
    }
  } catch (error) {
    console.log("error in login controller", error);
    return ResponseService.failed(
      res,
      "Something wrong happend",
      StatusCode.srevrError
    );
  }
};

module.exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const validationError = checkRequiredFields({
      email,
    });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const userExist = UserModel.findOne({ email });
    if (!userExist)
      return ResponseService.failed(
        res,
        "Email not registered",
        StatusCode.notFound
      );

    return ResponseService.success(res, "otp sent to your mail", result);
  } catch (error) {
    console.log("error", error?.message);
    return ResponseService.failed(res, error.message || error);
  }
};
