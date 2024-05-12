const { StatusCode } = require("../../common/Constants");
const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const rolesModel = require("../../Models/rolesModel");
const staffModel = require("../../Models/staffModel");

module.exports.addStaff = async (req, res) => {
  try {
    const { name } = req.body;

    const validationError = checkRequiredFields({ name });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.badRequest);

    const isRoleExist = await rolesModel.findOne({ name });
    if (isRoleExist) return ResponseService.failed(res, "Role already exist");

    const newRole = new rolesModel({ name });
    const result = await newRole.save();

    return ResponseService.success(res, `Role added successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.getStaffList = async (req, res) => {
  try {
    const { status } = req.body;
    const queryObj = {};

    if (status) {
      queryObj.status = status;
    }

    const allRoles = await staffModel.find({ ...queryObj });
    const staffCount = await staffModel.countDocuments({ ...queryObj });

    const response = {
      items: allRoles,
      totalCount: staffCount,
    };

    return ResponseService.success(res, `Roles found successfully`, response);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.updateStaff = async (req, res) => {
  try {
    const { roleId, name } = req.body;

    const validationError = checkRequiredFields({ roleId, name });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.badRequest);

    const isRoleExist = await rolesModel.findOne({ _id: roleId });
    if (!isRoleExist) return ResponseService.failed(res, "Role does not already exist");

    const result = await rolesModel.updateOne({ _id: roleId }, { name: name });

    return ResponseService.success(res, `Role updated successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.deleteStaff = async (req, res) => {
  try {
    const { roleId, name } = req.body;

    const validationError = checkRequiredFields({ roleId, name });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.badRequest);

    const isRoleExist = await rolesModel.findOne({ _id: roleId });
    if (!isRoleExist) return ResponseService.failed(res, "Role does not already exist");

    const result = await rolesModel.deleteOne({ _id: roleId });

    return ResponseService.success(res, `Role deleted successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};
