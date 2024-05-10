const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const queryModel = require("../../Models/queryModel");

module.exports.getRolesList = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.body;
    const queryObj = {};

    if (status) {
      queryObj.status = status;
    }

    const allQueries = await queryModel
      .find({ ...queryObj })
      .skip((page - 1) * limit)
      .limit(limit);

    return ResponseService.success(res, `Queries found successfully`, allQueries);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};
