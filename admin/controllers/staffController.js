const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { StatusCode } = require("../../common/Constants");
const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { transporter } = require("../../firebaseConfig");
const otpModel = require("../../Models/otpModel");
const staffModel = require("../../Models/staffModel");

module.exports.addStaff = async (req, res) => {
  try {
    const {
      emergencyAddress,
      emergencyEmail,
      emergencyMobile,
      emergencyCity,
      emergencyCountry,
      firstName,
      birthDate,
      address,
      city,
      country,
      email,
      mobile,
      role,
    } = req.body;

    const validationError = checkRequiredFields({
      emergencyAddress,
      emergencyEmail,
      emergencyMobile,
      emergencyCity,
      emergencyCountry,
      firstName,
      birthDate,
      address,
      city,
      country,
      email,
      mobile,
      role,
    });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.badRequest);

    const isStaffExist = await staffModel.findOne({ email }).lean();
    console.log("isStaffExist", isStaffExist);
    if (isStaffExist && isStaffExist.status !== "deleted")
      return ResponseService.failed(res, "Staff already exist with this email");

    let result = {};
    if (isStaffExist && isStaffExist.status === "deleted") {
      result = await staffModel.updateOne({ email }, { status: "inactive" });
    } else {
      const newStaff = new staffModel({ ...req.body });
      result = await newStaff.save();
    }

    const errorSendingMail = await sendMail(email);

    return ResponseService.success(res, `Staff registered successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports.getStaffList = async (req, res) => {
  try {
    const { role, country, search } = req.body;
    const queryObj = {};
    queryObj.status = { $ne: "deleted" };

    if (role) {
      queryObj.role = role;
    }
    if (country) {
      queryObj.country = country;
    }
    if (search) {
      queryObj["$or"] = [
        {
          firstName: { $regex: search || "", $options: "i" },
        },
        {
          surname: { $regex: search || "", $options: "i" },
        },
        {
          email: { $regex: search || "", $options: "i" },
        },
      ];
    }

    const staffList = await staffModel.find({ ...queryObj }).populate("country city role");
    const staffCount = await staffModel.countDocuments({ ...queryObj });

    const response = {
      items: staffList,
      totalCount: staffCount,
    };

    return ResponseService.success(res, `Roles found successfully`, response);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports.getStaffDetails = async (req, res) => {
  try {
    const { staffId } = req.body;

    if (!staffId) return ResponseService.failed(res, "staffId is required", StatusCode.badRequest);

    const staffDetails = await staffModel
      .findOne({ _id: staffId })
      .populate("country city role emergencyCountry emergencyCity")
      .lean();
    if (!staffDetails) return ResponseService.failed(res, "staff not found", StatusCode.notFound);

    return ResponseService.success(res, `Roles found successfully`, staffDetails);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, server, 400);
  }
};

module.exports.updateStaff = async (req, res) => {
  try {
    const {
      _id,
      emergencyAddress,
      emergencyEmail,
      emergencyMobile,
      emergencyCity,
      emergencyCountry,
      firstName,
      birthDate,
      address,
      city,
      country,
      email,
      mobile,
      role,
    } = req.body;

    const validationError = checkRequiredFields({
      _id,
      emergencyAddress,
      emergencyEmail,
      emergencyMobile,
      emergencyCity,
      emergencyCountry,
      firstName,
      birthDate,
      address,
      city,
      country,
      email,
      mobile,
      role,
    });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.badRequest);

    const isStaffExist = await staffModel.findOne({ _id: _id });
    if (!isStaffExist) return ResponseService.failed(res, "Staff does not already exist");

    const result = await staffModel.updateOne({ _id: _id }, { ...req.body });

    return ResponseService.success(res, `Staff updated successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports.deleteStaff = async (req, res) => {
  try {
    const { staffId } = req.body;

    const validationError = checkRequiredFields({ staffId });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.badRequest);

    const isStaffExist = await staffModel.findOne({ _id: staffId });
    if (!isStaffExist) return ResponseService.failed(res, "Staff does not already exist");

    const result = await staffModel.updateOne({ _id: staffId }, { status: "deleted" });

    return ResponseService.success(res, `Staff deleted successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error);
  }
};

const sendMail = async (email) => {
  try {
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
      process.env.JWT_SECRET_KEY
      // { expiresIn: "5m" }
    );

    const mailOptions = {
      from: "Manish Mittal <no-reply@manishmittal.tech>",
      to: email,
      subject: "Set Password",
      html: `<p style="font-size: 16px;">
      Click on the link below  to set your account password on autotitanic.com<br/>
        <a href="${process.env.ADMIN_WEBSITE_DOMAIN}set/password?token=${emailToken}&email=${email}">
        Click here to set password
        <a/>
      </p>
    <br />`,
    };

    // returning result
    transporter.sendMail(mailOptions, async (erro, info) => {
      if (erro) {
        return erro;
      }

      return null;
    });
  } catch (error) {
    console.log("error", error?.message);
  }
};
