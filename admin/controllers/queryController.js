const { ResponseService } = require("../../common/responseService");
const queryModel = require("../../Models/queryModel");

module.exports.allQuery = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.body;

    const allQueries = await queryModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit);

    return ResponseService.success(res, `Queries found successfully`, allQueries);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};
