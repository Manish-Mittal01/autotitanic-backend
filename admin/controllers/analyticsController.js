const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const UserModel = require("../../Models/UserModel");
const vehiclesModel = require("../../Models/vehiclesModel");
const { getMonth } = require("../../contants");

module.exports.getUserAnalytics = async (req, res) => {
  try {
    const { filterType } = req.params;
    // data: [44, 55, 41, 67, 22, 43, 54, 32, 44, 55, 41, 67],
    const totalUser = await UserModel.countDocuments();

    const usersCount = await UserModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)), // Filter documents created in the last 12 months
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" }, // Extract the year from the createdAt field
            month: { $month: "$createdAt" }, // Extract the month from the createdAt field
          },
          count: { $sum: 1 }, // Count the number of users in each group
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }, // Sort the result by year and month
      },
    ]);

    const data = {};
    for await (let item of usersCount) {
      data[getMonth[item._id?.month]] = item.count;
    }

    const response = {
      records: data,
      totalCount: totalUser,
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
    const totalVehicles = await vehiclesModel.countDocuments({ status: { $ne: "draft" } });

    const vehiclesCount = await vehiclesModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)), // Filter documents created in the last 12 months
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" }, // Extract the year from the createdAt field
            month: { $month: "$createdAt" }, // Extract the month from the createdAt field
          },
          count: { $sum: 1 }, // Count the number of users in each group
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }, // Sort the result by year and month
      },
    ]);

    const data = {};
    for await (let item of vehiclesCount) {
      data[getMonth[item._id?.month]] = item.count;
    }

    const response = {
      records: data,
      totalCount: totalVehicles,
    };

    return ResponseService.success(res, "Analytics found successfully", response);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};
