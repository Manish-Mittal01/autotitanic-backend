const User = require("../../user/Models/UserModel");
const { StatusCode } = require("../../common/Constants");
const { ResponseService } = require("../../common/responseService")

module.exports.blockUser = async (req, res) => {
  let { userId } = req.body;

  if (!userId) return ResponseService.failed(res, "userId is required", StatusCode.badRequest)

  const user = await User.findOne({
    userId,
  });

  if (!user) return ResponseService.failed(res, "no user found", StatusCode.notFound)
  let result;
  if (user.status === "blocked") {
    result = await User.updateOne(
      { _id: user._id },
      { status: "active" }
    );
  } else {
    result = await User.updateOne(
      { _id: user._id },
      { status: "blocked" }
    );
  };

  const updatedUser = await User.findOne({
    userId,
  });
  const newResult = {
    userId: userId,
    status: updatedUser.status
  };

  return ResponseService.success(res, "user status updated", newResult)
};
