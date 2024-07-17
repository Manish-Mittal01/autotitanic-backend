const { ResponseService } = require("./responseService");

module.exports.appVersion = async (req, res) => {
  try {
    return ResponseService.success(res, "App version", { version: "1.0.0" });
  } catch (error) {
    console.log("app version error", error);
    return ResponseService.serverError(res, error);
  }
};
