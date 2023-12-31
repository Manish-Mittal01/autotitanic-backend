const { ResponseService } = require("../../common/responseService");
const makeModel = require("../../Models/makeModel");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");

module.exports.getAllMake = async (req, res) => {
  try {
    const { type } = req.query;

    const queryObj = {};
    if (type) {
      queryObj.type = type;
    }

    const allMake = await makeModel
      .find({ ...queryObj }, null, {
        sort: { label: 1 },
      })
      .lean();

    const totalCount = await makeModel.count();

    const response = {
      items: allMake,
      totalCount: totalCount,
    };

    return ResponseService.success(res, "Make list found successfully", response);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};
