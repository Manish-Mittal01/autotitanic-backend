const { StatusCode } = require("../../common/Constants");
const { ResponseService } = require("../../common/responseService");
const adminModel = require("../models/adminModel");
const bcrypt = require("bcrypt");

class AdminService {
  static async getDetails(req, res) {
    const { userId } = req.query;

    const admin = await adminModel.findOne({ userId: userId });

    if (!admin) {
      return ResponseService.failed(res, "No admin found", StatusCode.notFound);
    }

    // const bankDetails = await bankDetailsModel.find({ userId: userId });
    var data = {
      ...admin,
      // bankDetails,
    };

    return ResponseService.success(res, "Admin found", data);
  }

  static async getAdminUPI(req, res) {
    const admin = await adminModel.find();
    if (!admin || admin.length == 0) {
      return ResponseService.failed(
        res,
        "Admin not found",
        StatusCode.notFound
      );
    }
    console.log(admin);
    return ResponseService.success(
      res,
      "Admin found",
      admin[admin.length - 1].upi
    );
  }

  static async addAdmin(req, res) {
    let { mobile, password, upi, prevAdmin, prevAdminPassword } = req.body;

    if (!mobile)
      return ResponseService.failed(
        res,
        "admin mobile required",
        StatusCode.badRequest
      );
    if (!password)
      return ResponseService.failed(
        res,
        "admin password required",
        StatusCode.badRequest
      );
    if (!upi)
      return ResponseService.failed(
        res,
        "admin upi required",
        StatusCode.badRequest
      );
    if (!prevAdmin)
      return ResponseService.failed(
        res,
        "Previous admin mobile required",
        StatusCode.badRequest
      );
    if (!prevAdminPassword)
      return ResponseService.failed(
        res,
        "Previous admin password required",
        StatusCode.badRequest
      );

    const adminExist = await adminModel.findOne({ mobile: mobile });
    if (adminExist)
      return ResponseService.failed(
        res,
        "admin already exist",
        StatusCode.forbidden
      );

    const adminAuth = await adminModel.findOne({ mobile: prevAdmin });
    if (!adminAuth)
      return ResponseService.failed(
        res,
        "invalid admin details",
        StatusCode.badRequest
      );
    const validAdmin = await bcrypt.compare(
      prevAdminPassword,
      adminAuth.password
    );

    if (!adminAuth || !validAdmin)
      return ResponseService.failed(
        res,
        "Previous Admin authentication failed",
        StatusCode.unauthorized
      );
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    const admin = new adminModel({
      mobile,
      password,
      upi,
    });

    let result = await admin.save();
    result = {
      mobile: result.mobile,
      upi: result.upi,
      userId: result.userId,
    };

    return ResponseService.success(res, "Admin added successfully", result);
  }
}

module.exports.AdminService = AdminService;
