const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const variantModel = require("../../Models/variantModel");

module.exports.getVariantList = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.body;

    const queryObj = {};
    if (search) {
      queryObj.label = { $regex: search, $options: "i" };
    }

    // const allvariant = await variantModel
    //   .find({ ...queryObj }, null, {
    //     sort: { createdAt: -1 },
    //     skip: (page - 1) * limit,
    //     limit: limit,
    //   })
    //   .lean();

    const allvariant = await variantModel.aggregate([
      {
        $lookup: {
          from: "models",
          localField: "model",
          foreignField: "_id",
          as: "model",
        },
      },
      { $unwind: "$model" },
      {
        $match: {
          ...queryObj,
        },
      },
      {
        $sort: { label: 1 },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    const totalCount = await variantModel.countDocuments();

    const response = {
      items: allvariant,
      totalCount: totalCount,
    };

    return ResponseService.success(res, "Variant list found successfully", response);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};

module.exports.addVariant = async (req, res) => {
  try {
    const { label, model } = req.body;

    const validationError = checkRequiredFields({
      label,
      model,
    });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const newVariant = { label, model };
    const variant = new variantModel(newVariant);

    const isVariantExist = await variantModel.findOne({
      label: label,
      model: model,
    });

    if (isVariantExist) {
      return ResponseService.failed(res, "Variant already added", StatusCode.forbidden);
    }

    const result = await variant.save();

    return ResponseService.success(res, "Variant added successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.getVariantDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const validationError = checkRequiredFields({ id });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.badRequest);

    const variantDetails = await variantModel.findOne({ _id: id });

    if (!variantDetails)
      return ResponseService.failed(res, "Invalid variant id", StatusCode.notFound);

    return ResponseService.success(res, "Variant found successfully", variantDetails);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};

module.exports.updateVariant = async (req, res) => {
  try {
    const { label, _id } = req.body;

    const validationError = checkRequiredFields({
      label,
    });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isVariantExist = await variantModel.findOne({
      _id: _id,
    });

    if (!isVariantExist)
      return ResponseService.failed(res, "Variant not found", StatusCode.notFound);
    const result = await variantModel.updateOne(
      {
        _id: _id,
      },
      {
        $set: {
          label: label,
        },
      }
    );

    return ResponseService.success(res, "Variant updated successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.deleteVariant = async (req, res) => {
  try {
    const { id } = req.body;

    const validationError = checkRequiredFields({ id });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isMakeExist = await variantModel.findOne({
      _id: id,
    });

    if (!isMakeExist) return ResponseService.failed(res, "Variant not found", StatusCode.notFound);
    const result = await variantModel.deleteOne({
      _id: id,
    });

    return ResponseService.success(res, "Variant deleted successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};
