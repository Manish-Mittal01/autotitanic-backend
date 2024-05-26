const UserModel = require("../Models/UserModel");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const functions = require("firebase-functions");
const { StatusCode } = require("../common/Constants");
const { ResponseService } = require("../common/responseService");
const { checkRequiredFields } = require("../common/utility");
const otpModel = require("../Models/otpModel");
const { UserServices } = require("../services/userServices");
const cors = require("cors")({ origin: true });
const { transporter } = require("../firebaseConfig");
const staffModel = require("../Models/staffModel");

module.exports.setPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const validationError = checkRequiredFields({ token, password });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.badRequest);

    if (!token) return ResponseService.failed(res, "token not found", StatusCode.badRequest);

    const isTokenValid = await UserServices.validateToken(token);
    // console.log("isTokenValid", isTokenValid);
    if (isTokenValid?.tokenExpired || !isTokenValid.email)
      return ResponseService.failed(res, "Link expired or invalid link", StatusCode.unauthorized);

    let otpHolder = await otpModel.find({ email: isTokenValid.email }).lean();
    // console.log("otpHolder", otpHolder);
    if (otpHolder.length === 0)
      return ResponseService.failed(res, "Invalid link", StatusCode.badRequest);

    otpHolder = otpHolder.pop();

    if (isTokenValid.otp !== otpHolder.otp)
      return ResponseService.failed(res, "Invalid link", StatusCode.badRequest);

    const result = await staffModel.updateOne(
      { email: isTokenValid.email },
      { status: "active", password: password }
    );

    const otpDelete = await otpModel.deleteMany({
      email: otpHolder.email,
    });
    console.log("otpDelete", otpDelete);

    return ResponseService.success(res, "Password set successfully!");
  } catch (error) {
    console.log("verify email error", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports.staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const validationError = checkRequiredFields({ email, password });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const staff = await staffModel.findOne({ email }).populate("role");

    if (!staff || staff.status === "deleted")
      return ResponseService.failed(res, "User not Found", StatusCode.notFound);
    if (staff.status === "inactive")
      return ResponseService.failed(
        res,
        "Set password before login from link sent to email",
        StatusCode.forbidden
      );

    if (!staff.role?.name)
      return ResponseService.failed(res, "No position assigned to staff", StatusCode.notFound);

    const isPasswordCorrect = await bcrypt.compare(password, staff.password);

    if (staff.email === email && isPasswordCorrect) {
      const token = staff.generateJWT(staff);
      return ResponseService.success(res, "Login Successful", { token, userId: staff._id });
    } else {
      return ResponseService.failed(res, "Incorrect Email or Password", StatusCode.unauthorized);
    }
  } catch (error) {
    console.log("error in login controller", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports.sendOtp = functions.https.onRequest((req, res) => {
  try {
    cors(req, res, async () => {
      const { email } = req.body;

      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
      let isValidEmail = emailRegex.test(email);
      if (!email || !isValidEmail)
        return ResponseService.failed(res, "Invalid email", StatusCode.forbidden);

      const isUserExist = await UserModel.findOne({ email }).lean();
      if (!isUserExist)
        return ResponseService.failed(res, "user does not exit", StatusCode.notFound);

      const OTP = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      const otp = new otpModel({ email: email, otp: OTP });
      const salt = await bcrypt.genSalt(10);
      otp.otp = await bcrypt.hash(otp.otp, salt);
      const result = await otp.save();

      const mailOptions = {
        from: "Manish Mittal <no-reply@manishmittal.tech>", // Something like: Jane Doe <janedoe@gmail.com>
        to: email,
        // to: "devmanishmittal@gmail.com",
        subject: "Reset Password", // email subject
        html: `<div  style="font-size: 16px;">
                <p>Dear ${isUserExist?.name?.split(" ")?.[0] || "User"}</p>
                <br/>
                <p>Your One Time Password (OTP) to reset your AutoTitanic account password is ${OTP}. This can only be used once and it is valid for 15 minutes.
                </p>
                <br/>
                <p>Please do not share this with anyone.</p>
                <br/>
                <p>Kind regards,</p>
                <p>AutoTitanic</p>
               </div>   `, // email content in HTML
      };

      // returning result
      return transporter.sendMail(mailOptions, (erro, info) => {
        if (erro) {
          return ResponseService.failed(res, erro.toString(), StatusCode.badRequest);
        }

        return ResponseService.success(res, "Otp sent to your mail", result);
      });
    });
  } catch (error) {
    console.log("error", error?.message);
    return ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
});

module.exports.resetStaffPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const validationError = checkRequiredFields({ email, otp, password });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.badRequest);

    const otpHolder = await otpModel.find({ email }).lean();
    if (otpHolder.length === 0)
      return ResponseService.failed(res, "Otp expired", StatusCode.badRequest);

    const rightOtpFind = otpHolder.pop();
    const validOtp = await bcrypt.compare(otp, rightOtpFind.otp);
    if (!validOtp) return ResponseService.failed(res, "Invalid Otp", StatusCode.badRequest);

    const salt = await bcrypt.genSalt(10);
    let newPassword = await bcrypt.hash(password, salt);
    const result = await staffModel.updateOne({ email: email }, { password: newPassword });

    const otpDelete = await otpModel.deleteMany({
      email: rightOtpFind.email,
    });

    ResponseService.success(res, "Password updated!!");
  } catch (error) {
    console.log("error", error);
    ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};

module.exports.getStaffProfile = async (req, res) => {
  try {
    const { staffId } = req.body;

    const user = await staffModel
      .findOne({ _id: staffId })
      .populate("country city role emergencyCity emergencyCountry")
      .lean();

    if (!user) return ResponseService.failed(res, "User not found", StatusCode.notFound);

    ResponseService.success(res, "User found!!", user);
  } catch (error) {
    console.log("error", error);
    ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};

module.exports.changeStaffPassword = async (req, res) => {
  try {
    const { oldPassword, password, staffId } = req.body;

    const validationError = checkRequiredFields({ oldPassword, password, staffId });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.badRequest);

    const user = await staffModel.findOne({ _id: staffId });
    if (!user) return ResponseService.failed(res, "User not found", StatusCode.badRequest);

    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordCorrect)
      return ResponseService.failed(res, "incorrect old password", StatusCode.badRequest);

    const salt = await bcrypt.genSalt(10);
    let newPassword = await bcrypt.hash(password, salt);
    const result = await staffModel.updateOne({ _id: staffId }, { password: newPassword });

    ResponseService.success(res, "Password updated!!", result);
  } catch (error) {
    console.log("error", error);
    ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};
