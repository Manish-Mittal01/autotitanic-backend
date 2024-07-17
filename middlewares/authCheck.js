const { StatusCode } = require("../common/Constants");
const { ResponseService } = require("../common/responseService");
const UserModel = require("../Models/UserModel");
const { UserServices } = require("../services/userServices");

module.exports.validateStaffToken = async (req, res, next) => {
  try {
    const token = req.headers.token;

    if (!token) ResponseService.failed(res, "Token is required", StatusCode.badRequest);

    const isTokenValid = await UserServices.validateToken(token);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

    req.body.staffId = isTokenValid._id;
    next();
  } catch (error) {
    console.log("validateStaffToken error", error);
    ResponseService.serverError(res, error);
  }
};

module.exports.validateUserToken = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];

    if (!token) ResponseService.failed(res, "Token is required", StatusCode.badRequest);

    const isTokenValid = await UserServices.validateToken(token);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

    const request = req;
    request.body = { ...request.body, userId: isTokenValid._id };
    next();
    // return request;
  } catch (error) {
    console.log("validateStaffToken error", error);
    ResponseService.serverError(res, error);
  }
};

module.exports.validateUser = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];

    if (!token) return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

    const isTokenValid = await UserServices.validateToken(token);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

    const userExist = await UserModel.findOne({ _id: isTokenValid._id });
    if (!userExist) return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

    if (userExist && (userExist.status === "blocked" || userExist.status === "deleted"))
      return ResponseService.failed(res, "Invalid user", StatusCode.forbidden);

    const request = req;
    request.body = { ...request.body, user: userExist };
    next();
  } catch (error) {
    ResponseService.serverError(res, error);
  }
};
