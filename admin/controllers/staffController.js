const { StatusCode } = require("../../common/Constants");
const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
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

    const isStaffExist = await staffModel.findOne({ email });
    if (isStaffExist) return ResponseService.failed(res, "Staff already exist with this email");

    const newStaff = new staffModel({ ...req.body });
    const result = await newStaff.save();

    return ResponseService.success(res, `Staff registered successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
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
    return ResponseService.failed(res, error, 400);
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
    return ResponseService.failed(res, error, 400);
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
    return ResponseService.failed(res, error, 400);
  }
};
