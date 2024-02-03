const { Types } = require("mongoose");
const User = require("../../Models/UserModel");
const { ResponseService } = require("../../common/responseService");
const { StatusCode } = require("../../common/Constants");

module.exports.allUsers = async (req, res) => {
  const { page = 1, limit = 10, country } = req.body;

  let queryObj = {};
  if (country) {
    queryObj.country = country;
  }

  let users = await User.find(queryObj)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("country")
    .lean();

  const usersCount = await User.countDocuments(queryObj);

  return ResponseService.success(res, "User list found", { items: users, totalCount: usersCount });
};

module.exports.blockUser = async (req, res) => {
  try {
    let { userId } = req.body;

    if (!userId) return ResponseService.failed(res, "userId is required", StatusCode.notFound);
    const isValidId = Types.ObjectId.isValid(userId);
    if (!isValidId) return ResponseService.failed(res, "Invalid userId", StatusCode.badRequest);

    const user = await User.findOne({
      _id: userId,
    });

    if (!user) return ResponseService.failed(res, "User not found", StatusCode.notFound);
    let result;
    if (user.status === "blocked") {
      result = await User.updateOne({ _id: user._id }, { status: "active" });
    } else {
      result = await User.updateOne({ _id: user._id }, { status: "blocked" });
    }

    return ResponseService.success(res, "user status updated", result);
  } catch (error) {
    return ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};
