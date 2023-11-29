const { StatusCode } = require("../../common/Constants");
const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const UserModel = require("../Models/UserModel");

module.exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      userType,
      country,
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
      password,
    });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const newUser = {
      name,
      email,
      userType,
      country,
      mobile,
      password,
    };
    const user = new UserModel(newUser);

    let result = {};
    result = await user.save();

    return ResponseService.success(res, "User registered successfully", result);
  } catch (error) {
    console.log("error", error?.message);
    return ResponseService.failed(res, error.message || error);
  }
};
