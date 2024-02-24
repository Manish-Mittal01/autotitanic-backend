const { ResponseService } = require("../../common/responseService");
const { StatusCode } = require("../../common/Constants");
const allModels = require("../../Models/allModels");
const { checkRequiredFields } = require("../../common/utility");

module.exports.getAllModel = async (req, res) => {
  try {
    const { makeId } = req.params;
    const { type } = req.query;

    const validationError = checkRequiredFields({ makeId });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const allModel = await allModels
      .find({ make: makeId, type: type || "cars" }, null, {
        sort: { label: 1 },
      })
      .lean();

    const totalCount = await allModels.countDocuments({ make: makeId });

    const response = {
      items: allModel,
      totalCount: totalCount,
    };

    return ResponseService.success(res, "Model list found successfully", response);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};
