const { ResponseService } = require("../../common/responseService");
const makeModel = require("../../Models/makeModel");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");

module.exports.getAllMake = async (req, res) => {
  try {
    const allMake = await makeModel.find({}, null, { sort: { label: 1 } });

    return ResponseService.success(
      res,
      "Make list found successfully",
      allMake
    );
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};

module.exports.addMake = async (req, res) => {
  try {
    const { label, vehicleType, logo } = req.body;

    const validationError = checkRequiredFields({ label, vehicleType, logo });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const newMake = { label, vehicleType, logo };
    const make = new makeModel(newMake);

    const isMakeExist = await makeModel.findOne({
      label: label,
    });

    let result = {};
    if (isMakeExist) {
      return ResponseService.failed(
        res,
        "Make with label already exits",
        StatusCode.forbidden
      );
    }

    result = await make.save();

    return ResponseService.success(res, "Make added successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.getMakeDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const makeDetails = await makeModel.find({ _id: id });

    if (!makeDetails)
      return ResponseService.failed(
        res,
        "Invalid make id",
        StatusCode.notFound
      );

    return ResponseService.success(
      res,
      "Make list found successfully",
      makeDetails
    );
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};

module.exports.updateMake = async (req, res) => {
  try {
    const { label, vehicleType, logo, makeId } = req.body;

    const validationError = checkRequiredFields({
      label,
      vehicleType,
      logo,
      makeId,
    });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isMakeExist = await makeModel.findOne({
      _id: makeId,
    });

    if (!isMakeExist)
      return ResponseService.failed(
        res,
        "Make not found with thid id",
        StatusCode.notFound
      );
    const result = await makeModel.updateOne(
      {
        _id: makeId,
      },
      {
        $set: {
          vehicleType: vehicleType,
          logo: logo,
          value: value,
        },
      }
    );

    return ResponseService.success(res, "Make added successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.deleteMake = async (req, res) => {
  try {
    const { makeId } = req.body;

    const validationError = checkRequiredFields({ makeId });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isMakeExist = await makeModel.findOne({
      _id: makeId,
    });

    if (!isMakeExist)
      return ResponseService.failed(
        res,
        "Make not found with thid id",
        StatusCode.notFound
      );
    const result = await makeModel.deleteOne({
      _id: makeId,
    });

    return ResponseService.success(res, "Make added successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};
