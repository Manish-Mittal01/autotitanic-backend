const { StatusCode } = require("../../common/Constants");
const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const queryModel = require("../../Models/queryModel");

module.exports.allQuery = async (req, res) => {
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

module.exports.getQueryDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const validationError = checkRequiredFields({ id });
    if (!id) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const query = await queryModel.findOne({ _id: id });
    if (!query) return ResponseService.failed(res, "Query not exist", StatusCode.notFound);

    return ResponseService.success(res, `Queries updated successfully`, query);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.updateQuery = async (req, res) => {
  try {
    const { id, status } = req.body;

    const validationError = checkRequiredFields({ id, status });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const result = await queryModel.updateOne({ _id: id }, { status: status });

    return ResponseService.success(res, `Queries updated successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.addReplyToQuery = async (req, res) => {
  try {
    const { queryId, reply } = req.body;

    const validationError = checkRequiredFields({
      queryId,
      replyTitle: reply.title,
      replyBody: reply.body,
    });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isQueryExist = await queryModel.findOne({ _id: queryId });
    if (!isQueryExist) return ResponseService.failed(res, "Query not exist", StatusCode.notFound);

    const result = await queryModel.updateOne({ _id: queryId }, { $push: { replies: reply } });

    return ResponseService.success(res, `Queries updated successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};
