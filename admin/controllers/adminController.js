const { AdminService } = require("../services/adminService");

class AdminController {
  static getDetails = async (req, res) => AdminService.getDetails(req, res);

  static getAdminUPI = async (req, res) => AdminService.getAdminUPI(req, res);
  static addAdmin = async (req, res) => AdminService.addAdmin(req, res);
}

module.exports.AdminController = AdminController;
