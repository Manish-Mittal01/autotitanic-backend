const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const vehiclesModel = require("../Models/vehiclesModel");

module.exports.addVehicle = async (req, res) => {
  try {
    const {
      condition,
      country,
      state,
      title,
      description,
      media,
      price,
      currency,
      type,
    } = req.body;

    const validationError = checkRequiredFields({
      condition,
      country,
      state,
      title,
      description,
      media,
      price,
      currency,
      type,
    });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const newVehicle = { ...req.body };
    const vehicle = new vehiclesModel(newVehicle);

    let result = {};
    result = await vehicle.save();

    return ResponseService.success(
      res,
      `${req.body.type} added successfully`,
      result
    );
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.getAllvehicles = async (req, res) => {
  try {
    const allVehicles = await vehiclesModel.find();

    return ResponseService.success(
      res,
      "vehicles list found successfully",
      allVehicles
    );
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};
