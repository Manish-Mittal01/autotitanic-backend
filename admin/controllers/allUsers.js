const User = require("../../Models/UserModel");
const { success, error } = require("../../common/Constants");

module.exports.allUsers = async (req, res) => {
  let users = await User.find();

  let usersDetails = [];
  users.map((item) => {
    let userAllDetails = {
      username: item.name,
      userId: item.userId,
      mobile: item.mobile,
      status: item.status,
    };
    usersDetails.push(userAllDetails);
  });

  res.status(200).send({
    status: success,
    message: "all users found",
    totalUsers: users.length,
    users: usersDetails,
  });
};
