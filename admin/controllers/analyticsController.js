const { ResponseService } = require("../../common/responseService");
const UserModel = require("../../Models/UserModel");
const vehiclesModel = require("../../Models/vehiclesModel");
const { Types } = require("mongoose");
const { getMonth } = require("../../utils/contants");

module.exports.getUserAnalytics = async (req, res) => {
  try {
    const { country } = req.body;

    const queryObj = {};
    if (country) {
      queryObj.country = Types.ObjectId(country);
    }

    const usersCount = await UserModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)), // Filter documents created in the last 12 months
          },
          ...queryObj,
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

    const totalUser = await UserModel.countDocuments(queryObj);
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
    const { country } = req.body;

    const queryObj = {};
    if (country) {
      queryObj.country = Types.ObjectId(country);
    }

    const vehiclesCount = await vehiclesModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)), // Filter documents created in the last 12 months
          },
          status: { $ne: "draft" },
          ...queryObj,
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

    const totalVehicles = await vehiclesModel.countDocuments({
      status: { $ne: "draft" },
      ...queryObj,
    });

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
