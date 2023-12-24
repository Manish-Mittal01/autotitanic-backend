const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const allModels = require("../../Models/allModels");

module.exports.getModelList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    let allModel = [];

    allModel = await allModels
      .find({}, null, {
        sort: { createdAt: -1 },
        skip: (page - 1) * limit,
        limit: limit,
      })
      .lean()
      .populate("make");

    const totalCount = await allModels.count();

    const response = {
      items: allModel,
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

module.exports.addModel = async (req, res) => {
  try {
    const { label, type, make } = req.body;
    console.log("label", label);

    const validationError = checkRequiredFields({
      label,
      type,
      make,
    });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const newModel = { label, type, make };
    const model = new allModels(newModel);

    const isModelExist = await allModels.findOne({
      label: label,
    });

    if (isModelExist) {
      return ResponseService.failed(
        res,
        "Model with label already exits",
        StatusCode.forbidden
      );
    }

    const result = await model.save();

    return ResponseService.success(res, "Model added successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.getModelDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return ResponseService.failed(res, "Id is required", StatusCode.notFound);

    const modelDetails = await allModels.findOne({ _id: id });

    if (!modelDetails)
      return ResponseService.failed(
        res,
        "Model not found",
        StatusCode.notFound
      );

    return ResponseService.success(
      res,
      "Model found successfully",
      modelDetails
    );
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};

module.exports.updateModel = async (req, res) => {
  try {
    const { label, type, makeId, id } = req.body;

    const validationError = checkRequiredFields({
      label,
      type,
      makeId,
      id,
    });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isModelExist = await allModels.findOne({
      _id: id,
    });

    if (!isModelExist)
      return ResponseService.failed(
        res,
        "Model not found",
        StatusCode.notFound
      );
    const result = await allModels.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          label: label,
          type: type,
        },
      }
    );

    return ResponseService.success(res, "Model added successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.deleteModel = async (req, res) => {
  try {
    const { modelId } = req.body;

    const validationError = checkRequiredFields({ modelId });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isModelExist = await allModels.findOne({
      _id: modelId,
    });

    if (!isModelExist)
      return ResponseService.failed(
        res,
        "Model not found",
        StatusCode.notFound
      );
    const result = await allModels.deleteOne({
      _id: modelId,
    });

    return ResponseService.success(res, "Model removed successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};
