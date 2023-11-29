const User = require("../Models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { StatusCode } = require("../../common/Constants");
const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { success } = require("../../common/Constants").Status;

module.exports.login = async (req, res) => {
  const { mobile, password } = req.body;

  const validationError = checkRequiredFields({ mobile, password });
  if (validationError)
    return ResponseService.failed(res, validationError, StatusCode.notFound);

  if (password && typeof password !== "string")
    return ResponseService.failed(
      res,
      "Password must be string",
      StatusCode.created
    );

  const user = await User.findOne({
    mobile: mobile,
  });

  if (!user)
    return ResponseService.failed(res, "User not Found", StatusCode.notFound);
  if (user.status === "blocked")
    return ResponseService.failed(
      res,
      "User is blocked",
      StatusCode.unauthorized
    );

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  console.log(userAvatar);
  console.log(userAvatar.avatar);

  const avatarURL = `http://localhost:4000/user-avatars/${userAvatar.avatar}`;
  if (user.mobile === mobile && isPasswordCorrect) {
    const token = jwt.sign(
      {
        userId: user.userId,
        mobile: user.mobile,
        // referralCode: user.referralCode,
        email: user.email,
        userName: user.name,
        avatar: avatarURL,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );
    return res.status(200).send({
      status: success,
      message: "Login Successful",
      token: token,
    });
  } else {
    return ResponseService.failed(
      res,
      "Incorrect Mobile or Password",
      StatusCode.unauthorized
    );
  }
};
