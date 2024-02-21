const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const cityModel = require("../../Models/cityModel");
const UserModel = require("../../Models/UserModel");
const vehiclesModel = require("../../Models/vehiclesModel");

module.exports.getUserAnalytics = async (req, res) => {
  try {
    const { filterType } = req.params;

    const totalUser = await UserModel.countDocuments();

    const response = {
      users: { totalCount: totalUser },
    };

    return ResponseService.success(res, "Analytics found successfully", response);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};

module.exports.getVehicleAnalytics = async (req, res) => {
  try {
    const { filterType } = req.params;
    const usersList = await vehiclesModel.countDocuments({ status: { $ne: "draft" } });

    const response = {
      vehicles: { totalCount: usersList },
    };

    return ResponseService.success(res, "Analytics found successfully", response);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};
