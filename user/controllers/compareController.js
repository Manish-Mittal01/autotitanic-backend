const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const { UserServices } = require("../../services/userServices");
const compareModel = require("../../Models/compareModel");

module.exports.addToCompare = async (req, res) => {
  try {
    const { vehicle } = req.body;
    const token = req.headers["x-access-token"];

    const isTokenValid = await UserServices.validateToken(token);
    // console.log("isTokenValid", isTokenValid);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

    const validationError = checkRequiredFields({ vehicle });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isVehicleExist = await compareModel.findOne({ vehicle });
    if (isVehicleExist)
      return ResponseService.failed(res, "Vehicle already exist", StatusCode.forbidden);

    const compareList = await compareModel.find({ user: isTokenValid._id });

    if (compareList.length >= 5) {
      return ResponseService.failed(
        res,
        "You can only add up to 5 items in the list",
        StatusCode.forbidden
      );
    }

    const newVehicle = { vehicle, user: isTokenValid._id };
    const addedVehicle = new compareModel(newVehicle);
    const result = await addedVehicle.save();

    return ResponseService.success(res, `vehicle added successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.getCompareList = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];

    const isTokenValid = await UserServices.validateToken(token);
    // console.log("isTokenValid", isTokenValid);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

    const compareList = await compareModel.find({ user: isTokenValid._id }).populate({
      path: "user vehicle",
      populate: {
        path: "make model",
        // path: "make model variant",
        strictPopulate: false,
      },
    });

    return ResponseService.success(res, "Vehicle details found", compareList);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};

module.exports.removeCompareListItem = async (req, res) => {
  try {
    const { id } = req.body;
    const token = req.headers["x-access-token"];

    const isTokenValid = await UserServices.validateToken(token);
    // console.log("isTokenValid", isTokenValid);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

    if (!id) return ResponseService.failed(res, "Id is required", StatusCode.badRequest);

    const compareList = await compareModel.findOne({ _id: id });

    if (!compareList) return ResponseService.failed(res, "Vehicle not found", StatusCode.notFound);

    const result = await compareModel.deleteOne({
      _id: id,
    });

    return ResponseService.success(res, "Vehicle details found", result);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};
