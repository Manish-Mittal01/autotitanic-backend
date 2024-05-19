const { StatusCode } = require("../common/Constants");
const { ResponseService } = require("../common/responseService");
const { UserServices } = require("../services/userServices");

module.exports.validateStaffToken = async (req, res) => {
  try {
    const token = req.headers.token;
    if (!token) ResponseService.failed(res, "Token is required", StatusCode.badRequest);

    const isTokenValid = await UserServices.validateToken(token);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);
    const request = req;
    request.body = { ...request.body, staffId: isTokenValid._id };
    return request;
  } catch (error) {
    console.log("validateStaffToken error", error);
    ResponseService.serverError(res, error);
  }
};
