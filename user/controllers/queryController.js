const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const queryModel = require("../../Models/queryModel");

module.exports.addQuery = async (req, res) => {
  try {
    const { name, phone, email, comment, file } = req.body;

    const validationError = checkRequiredFields({ name, email, phone, comment });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const query = new queryModel({ name, phone, email, comment, file });
    const result = await query.save();

    return ResponseService.success(res, `Query added successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};
