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
const compareModel = require("../Models/compareModel");
const transporter = require("../firebaseConfig");

/**
 * Here we're using Gmail to send
 */
// let transporter = nodemailer.createTransport({
//   service: "gmail",
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: "devmanishmittal@gmail.com",
//     pass: "kzqz wwku cyzp zjjq",
//   },
// });

module.exports.register = async (req, res) => {
  try {
    const { name, email, userType, country, mobile, password, image, whatsapp } = req.body;

    const validationError = checkRequiredFields({
      name,
      email,
      userType,
      country,
      mobile,
      // countryCode,
      password,
    });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const userExist = await UserModel.findOne({ email });

    if (userExist)
      return ResponseService.failed(res, "User already exist with email", StatusCode.forbidden);

    const newUser = {
      name,
      email,
      userType,
      country,
      mobile,
      whatsapp,
      // countryCode,
      password,
      dealerLogo: userType === "private" ? "" : image,
      userAvatar: userType === "private" ? image : "",
    };
    const user = new UserModel(newUser);

    const salt = await bcrypt.genSalt(8);
    const encryptPassword = await bcrypt.hash(password, salt);
    user.password = encryptPassword;

    let result = await user.save();

    return ResponseService.success(res, "User registered successfully", result);
  } catch (error) {
    console.log("error", error?.message);
    return ResponseService.failed(res, error.message || error);
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const validationError = checkRequiredFields({ email, password });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    if (password && typeof password !== "string")
      return ResponseService.failed(res, "Password must be string", StatusCode.badRequest);

    const user = await UserModel.findOne({ email });

    if (!user) return ResponseService.failed(res, "User not Found", StatusCode.notFound);
    if (user.status === "blocked")
      return ResponseService.failed(res, "User is blocked", StatusCode.unauthorized);

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (user.email === email && isPasswordCorrect) {
      const token = user.generateJWT(user);

      return ResponseService.success(res, "Login Successful", { token });
    } else {
      return ResponseService.failed(res, "Incorrect Email or Password", StatusCode.unauthorized);
    }
  } catch (error) {
    console.log("error in login controller", error);
    return ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
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

      const isUserExist = await UserModel.findOne({ email });
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
        from: "Manish Mittal <devmanishmittal@gmail.com>", // Something like: Jane Doe <janedoe@gmail.com>
        to: email,
        // to: "devmanishmittal@gmail.com",
        subject: "Reset Password", // email subject
        html: `<p style="font-size: 16px;">Your Otp to reset password on autotitanic is ${OTP}. It is valid for only 5 minutes</p>
                    <br />
                `, // email content in HTML
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

module.exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const otpHolder = await otpModel.find({ email }).lean();
    if (otpHolder.length === 0)
      return ResponseService.failed(res, "Otp expired", StatusCode.badRequest);

    const rightOtpFind = otpHolder.pop();
    const validOtp = await bcrypt.compare(otp, rightOtpFind.otp);
    if (!validOtp) return ResponseService.failed(res, "Invalid Otp", StatusCode.badRequest);

    const salt = await bcrypt.genSalt(10);
    let newPassword = await bcrypt.hash(password, salt);
    result = await UserModel.updateOne({ email: email }, { password: newPassword });

    const otpDelete = await otpModel.deleteMany({
      email: rightOtpFind.email,
    });

    ResponseService.success(res, "Password updated!!");
  } catch (error) {
    console.log("error", error);
    ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};

module.exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, password } = req.body;

    const validationError = checkRequiredFields({ oldPassword, password });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.badRequest);

    const token = req.headers["x-access-token"];
    const isTokenValid = await UserServices.validateToken(token);
    // console.log("isTokenValid", isTokenValid);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

    const user = await UserModel.findOne({ _id: isTokenValid._id });
    if (!user) return ResponseService.failed(res, "User not found", StatusCode.badRequest);

    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordCorrect)
      return ResponseService.failed(res, "incorrect old password", StatusCode.badRequest);

    const salt = await bcrypt.genSalt(10);
    let newPassword = await bcrypt.hash(password, salt);
    const result = await UserModel.updateOne({ _id: isTokenValid._id }, { password: newPassword });

    ResponseService.success(res, "Password updated!!", result);
  } catch (error) {
    console.log("error", error);
    ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};

module.exports.getUserProfile = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];

    const isTokenValid = await UserServices.validateToken(token);
    // console.log("isTokenValid", isTokenValid);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

    const user = await UserModel.findOne({ _id: isTokenValid._id }).populate("country").lean();
    const compareCount = await compareModel.countDocuments({ user: isTokenValid._id });

    if (!user) return ResponseService.failed(res, "User not found", StatusCode.notFound);

    ResponseService.success(res, "User found!!", { ...user, compareCount: compareCount || 0 });
  } catch (error) {
    console.log("error", error);
    ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};

module.exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, userType, country, mobile, image, whatsapp, _id } = req.body;
    const token = req.headers["x-access-token"];

    const isTokenValid = await UserServices.validateToken(token);
    // console.log("isTokenValid", isTokenValid);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

    const userExist = await UserModel.findOne({ _id });

    if (!userExist) return ResponseService.failed(res, "User not found", StatusCode.notFound);

    const newUser = {
      name,
      email,
      userType,
      country,
      mobile,
      whatsapp,
      dealerLogo: userType === "private" ? "" : image,
      userAvatar: userType === "private" ? image : "",
    };

    const result = await UserModel.updateOne({ _id: _id }, { ...newUser });

    return ResponseService.success(res, "User updated successfully", result);
  } catch (error) {
    console.log("error", error?.message);
    return ResponseService.failed(res, error.message || error);
  }
};
