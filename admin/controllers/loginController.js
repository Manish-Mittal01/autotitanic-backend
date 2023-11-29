const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { StatusCode } = require("../../common/Constants");
const { ResponseService } = require("../../common/responseService");
const adminModel = require("../models/adminModel");
const { success, error } = require("../../common/Constants").Status;

module.exports.login = async (req, res) => {
  const { mobile, password } = req.body;

  const errMsg = (message, code) => {
    res.status(code).json({
      status: success,
      message: message,
    });
  };

  const admin = await adminModel.findOne({ mobile: mobile });
  if (!admin) return ResponseService.failed(res, "no admin found", StatusCode.notFound);

  isPasswordCorrect = await bcrypt.compare(password, admin.password)

  if (!mobile || !isPasswordCorrect)
    return errMsg("Invalid username or password", StatusCode.badRequest);


  if (admin.mobile === mobile && isPasswordCorrect) {
    const token = jwt.sign(
      {
        userId: admin.userId,
        mobile: admin.mobile,
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
    return errMsg("Incorrect Mobile or Password", 401);
  }
};
