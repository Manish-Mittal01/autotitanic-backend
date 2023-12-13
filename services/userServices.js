const UserModel = require("../Models/UserModel");
const jwt = require("jsonwebtoken");
const { ResponseService } = require("../common/responseService");

class UserServices {
  static async checkUserActive(userId) {
    const user = await UserModel.findOne({ userId: userId });

    if (!user) {
      return null;
    }
    if (user.status === "active") {
      return true;
    }
    return false;
  }

  static async validateToken(token) {
    const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
    const user = {};

    jwt.verify(token, JWT_SECRET_KEY, (error, decoded) => {
      if (error) {
        user.tokenExpired = error.message;
      } else {
        user = decoded;
      }
    });
    return user;
  }
}

module.exports.UserServices = UserServices;
