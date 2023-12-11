const { ResponseService } = require("../../common/responseService");
const makeModel = require("../../Models/makeModel");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const allModels = require("../../Models/allModels");

module.exports.getAllMake = async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;

    let allMake = [];

    if (type) {
      allMake = await makeModel.find({ type: [type] }, null, {
        sort: { label: 1 },
      });
    } else if (page) {
      allMake = await makeModel.find({}, null, {
        // sort: { label: 1 },
        skip: (page - 1) * limit,
        limit: limit,
      });
    }

    for (let make of allMake) {
      const models = await allModels.find({ _id: make._id });
      make._doc.models = models;
    }

    const totalCount = allMake.length;

    const response = {
      items: allMake,
      totalCount: totalCount,
    };

    return ResponseService.success(
      res,
      "Make list found successfully",
      response
    );
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};

module.exports.addMake = async (req, res) => {
  try {
    const { label, type, logo } = req.body;

    const validationError = checkRequiredFields({
      label,
      type,
      logo,
    });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const newMake = { label, type, logo };
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
    const { label, type, logo, makeId } = req.body;

    const validationError = checkRequiredFields({
      label,
      type,
      logo,
      makeId,
    });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isMakeExist = await makeModel.findOne({
      _id: makeId,
    });

    if (!isMakeExist)
      return ResponseService.failed(res, "Make not found", StatusCode.notFound);
    const result = await makeModel.updateOne(
      {
        _id: makeId,
      },
      {
        $set: {
          lebel: label,
          type: type,
          logo: logo,
        },
      }
    );

    return ResponseService.success(res, "Make updated successfully", result);
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
      return ResponseService.failed(res, "Make not found", StatusCode.notFound);
    const result = await makeModel.deleteOne({
      _id: makeId,
    });

    return ResponseService.success(res, "Make added successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};
