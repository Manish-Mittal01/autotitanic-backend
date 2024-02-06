const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const cityModel = require("../../Models/cityModel");
const UserModel = require("../../Models/UserModel");

module.exports.getAnalytics = async (req, res) => {
  try {
    const totalUser = await UserModel.countDocuments();

    const usersList = await UserModel.find({}, { createdAt: 1 });

    const response = {
      users: allCities,
      vehicles: totalCount[0]?.count || 0,
    };

    return ResponseService.success(res, "Cities list found successfully", response);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};
