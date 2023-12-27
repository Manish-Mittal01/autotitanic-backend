const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const variantModel = require("../../Models/variantModel");

module.exports.getAllVariant = async (req, res) => {
  try {
    const { modelId } = req.query;

    const validationError = checkRequiredFields({ type });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const allVariant = await variantModel
      .find({ modelId }, null, {
        sort: { label: 1 },
      })
      .lean();

    const totalCount = await variantModel.count();

    const response = {
      items: allVariant,
      totalCount: totalCount,
    };

    return ResponseService.success(
      res,
      "Variant list found successfully",
      response
    );
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};
