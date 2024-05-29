const UserModel = require("../Models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const functions = require("firebase-functions");
const { StatusCode } = require("../common/Constants");
const { ResponseService } = require("../common/responseService");
const { checkRequiredFields } = require("../common/utility");
const otpModel = require("../Models/otpModel");
const { UserServices } = require("../services/userServices");
const cors = require("cors")({ origin: true });
const compareModel = require("../Models/compareModel");
const { transporter } = require("../firebaseConfig");
const { Types } = require("mongoose");
const staffModel = require("../Models/staffModel");

module.exports.register = async (req, res) => {
  try {
    const { name, email, userType, country, mobile, password, image, whatsapp } = req.body;

    const validationError = checkRequiredFields({
      name,
      email,
      userType,
      country,
      mobile,
      password,
    });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    let isValidEmail = emailRegex.test(email);
    if (!email || !isValidEmail)
      return ResponseService.failed(res, "Invalid email", StatusCode.badRequest);
    if (!["private", "dealer"].includes(userType))
      return ResponseService.failed(res, "Invalid user type", StatusCode.badRequest);
    if (!Types.ObjectId.isValid(country))
      return ResponseService.failed(res, "Invalid country", StatusCode.badRequest);

    const userExist = await UserModel.findOne({ email });
    if (userExist && userExist.status === "active")
      return ResponseService.failed(res, "User already exist with email", StatusCode.forbidden);

    if (userExist && userExist.status === "blocked")
      return ResponseService.failed(res, "User with this email is blocked", StatusCode.forbidden);

    const OTP = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const otp = new otpModel({ email: email, otp: OTP });
    const otpSalt = await bcrypt.genSalt(10);
    otp.otp = await bcrypt.hash(otp.otp, otpSalt);
    const otpResult = await otp.save();

    const emailToken = jwt.sign(
      {
        email: email,
        otp: otpResult.otp,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "5m" }
    );

    const mailOptions = {
      from: "Autotitanic <autotitanic.com>",
      to: email,
      subject: "Verify email",
      html: `<p style="font-size: 16px;">
      Click on the link below  to verify your account on autotitanic.com<br/>
        <a href="${process.env.WEBSITE_DOMAIN}verify/email?token=${emailToken}&email=${email}">
        Click here to Verify your email
        <a/>
      </p>
    <br />`,
    };

    // returning result
    transporter.sendMail(mailOptions, async (erro, info) => {
      if (erro) {
        return ResponseService.serverError(res, erro);
      }

      if (!userExist) {
        const newUser = {
          name,
          email,
          userType,
          country,
          mobile,
          whatsapp,
          password,
          dealerLogo: userType === "private" ? "" : image,
          userAvatar: userType === "private" ? image : "",
        };
        const user = new UserModel(newUser);

        const salt = await bcrypt.genSalt(8);
        const encryptPassword = await bcrypt.hash(password, salt);
        user.password = encryptPassword;

        let result = await user.save();
      }

      return ResponseService.success(res, "Verification mail sent!", {});
    });
  } catch (error) {
    console.log("error", error?.message);
    return ResponseService.serverError(res, error);
  }
};

module.exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const validationError = checkRequiredFields({ email });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    let isValidEmail = emailRegex.test(email);
    if (!email || !isValidEmail)
      return ResponseService.failed(res, "Invalid email", StatusCode.forbidden);

    const userExist = await UserModel.findOne({ email });
    if (!userExist) return ResponseService.failed(res, "Email not registered", StatusCode.notFound);

    if (userExist && userExist.status === "active")
      return ResponseService.failed(res, "Email already verified", StatusCode.badRequest);

    if (userExist && userExist.status === "blocked")
      return ResponseService.failed(res, "Email is blocked", StatusCode.badRequest);

    const OTP = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const otp = new otpModel({ email: email, otp: OTP });
    const otpSalt = await bcrypt.genSalt(10);
    otp.otp = await bcrypt.hash(otp.otp, otpSalt);
    const otpResult = await otp.save();

    const emailToken = jwt.sign(
      {
        email: email,
        otp: otpResult.otp,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "5m" }
    );

    const mailOptions = {
      from: "Autotitanic <autotitanic.com>",
      to: email,
      subject: "Verify email",
      html: `<p style="font-size: 16px;">
      Click on the link below  to verify your account on autotitanic.com<br/>
        <a href="${process.env.WEBSITE_DOMAIN}verify/email?token=${emailToken}&email=${email}">
        Click here to Verify your email
        <a/>
      </p>
    <br />`,
    };

    return transporter.sendMail(mailOptions, async (erro, info) => {
      if (erro) {
        return ResponseService.serverError(res, erro);
      }
      return ResponseService.success(res, "Verification mail sent!", {});
    });
  } catch (error) {
    console.log("error", error?.message);
    return ResponseService.failed(res, error.message || error);
  }
};

module.exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) return ResponseService.failed(res, "token is required", StatusCode.badRequest);

    const isTokenValid = await UserServices.validateToken(token);
    if (isTokenValid?.tokenExpired || !isTokenValid.email)
      return ResponseService.failed(res, "Link expired", StatusCode.unauthorized);

    let otpHolder = await otpModel.find({ email: isTokenValid.email }).lean();
    if (otpHolder.length === 0)
      return ResponseService.failed(res, "Link expired", StatusCode.badRequest);

    otpHolder = otpHolder.pop();

    if (isTokenValid.otp !== otpHolder.otp)
      return ResponseService.failed(res, "Invalid token", StatusCode.badRequest);

    const result = await UserModel.updateOne({ email: isTokenValid.email }, { status: "active" });

    const otpDelete = await otpModel.deleteMany({
      email: otpHolder.email,
    });

    return ResponseService.success(res, "Email verified!");
  } catch (error) {
    console.log("verify email error", error);
    return ResponseService.serverError(res, error);
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
      if (user.status === "inactive") {
        return ResponseService.failed(res, "Verify email before login", StatusCode.forbidden);
      }
      const token = user.generateJWT(user);
      return ResponseService.success(res, "Login Successful", { token, userId: user._id });
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
      let isStaffExist = "";
      if (!isUserExist) {
        isStaffExist = await staffModel.findOne({ email }).lean();
        if (!isStaffExist)
          return ResponseService.failed(res, "user does not exit", StatusCode.notFound);
      }
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
        from: "Autotitanic <autotitanic.com>", // Something like: Jane Doe <janedoe@gmail.com>
        to: email,
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

module.exports.resetPassword = async (req, res) => {
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
    const result = await UserModel.updateOne({ email: email }, { password: newPassword });

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
    const { userId } = req.body;

    const user = await UserModel.findOne({ _id: userId }).populate("country").lean();
    const compareCount = await compareModel.countDocuments({ user: userId });

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
