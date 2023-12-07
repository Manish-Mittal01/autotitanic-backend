const { ResponseService } = require("../../common/responseService");
const makeModel = require("../../Models/makeModel");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");

module.exports.getAllModels = async (req, res) => {
  try {
    const { makeId } = req.body;
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

module.exports.addModel = async (req, res) => {
  try {
    const { label, vehicleType, logo, value } = req.body;

    const validationError = checkRequiredFields({
      label,
      vehicleType,
      logo,
      value,
    });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const newMake = { label, vehicleType, logo, value };
    const make = new makeModel(newMake);

    const isMakeExist = await makeModel.findOne({
      label: label,
    });

    if (isMakeExist) {
      return ResponseService.failed(
        res,
        "Make with label already exits",
        StatusCode.forbidden
      );
    }

    const result = await make.save();

    return ResponseService.success(res, "Make added successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.getModelDetails = async (req, res) => {
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

module.exports.updateModel = async (req, res) => {
  try {
    const { label, vehicleType, logo, makeId, value } = req.body;

    const validationError = checkRequiredFields({
      label,
      vehicleType,
      logo,
      makeId,
      value,
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
          lebel: label,
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

module.exports.deleteModel = async (req, res) => {
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
