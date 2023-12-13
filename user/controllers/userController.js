const bcrypt = require("bcrypt");
const User = require("../../Models/UserModel");
const UserAvatar = require("../../Models/userAvatarModel");
const { ResponseService } = require("../../common/responseService");
const { StatusCode, passwordMode } = require("../../common/Constants");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

module.exports.addUser = async (req, res) => {
  const { mobile, password, email, name } = req.body;

  // if (!password) return ResponseService.failed(res, "password is required", StatusCode.badRequest);
  // if (!mobile) return ResponseService.failed(res, "mobile is required", StatusCode.badRequest);
  // // if (!referralCode) return ResponseService.failed(res, "referralCode is required", StatusCode.badRequest);
  // if (!email) return ResponseService.failed(res, "email is required", StatusCode.badRequest);
  // if (!name) return ResponseService.failed(res, "name is required", StatusCode.badRequest);
  // let userExist = await User.findOne({
  //   mobile: mobile,
  // });
  // if (userExist) return ResponseService.failed(res, "Mobile already registered", StatusCode.forbidden);

  // let validreferal = await User.findOne({
  //   userId: referralCode,
  // });
  // if (!validreferal) {
  //   return ResponseService.failed(
  //     res,
  //     "Invalid Referral Code",
  //     StatusCode.forbidden
  //   );
  // }

  const newUser = {
    mobile,
    password,
    email,
    name,
  };
  const user = new User(newUser);
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  const token = user.generateJWT();
  let result = await user.save();
  result.token = token;

  if (req.file && req.file.filename) {
    const { filename, mimetype, destination, path: filePath, size } = req.file;
    const { userId } = result;

    if (mimetype.split("/")[0] !== "image") {
      fs.unlinkSync(filePath);
      return ResponseService.failed(
        res,
        "only image is allowed as profile picture",
        StatusCode.badRequest
      );
    }

    let compressedImageFileSavePath = path.resolve(destination, `0${filename}`);
    const resizedFile = await sharp(filePath)
      .resize(400)
      .png({ quality: 50 })
      .toFile(compressedImageFileSavePath);

    if (resizedFile.size > size) {
      fs.unlinkSync(compressedImageFileSavePath);
    } else {
      fs.unlinkSync(filePath);
    }

    const newUserAvatar = {
      userId: userId,
      avatar: filename,
    };

    const userAvatar = new UserAvatar(newUserAvatar);
    const avatarResult = await userAvatar.save();
  }

  return ResponseService.success(res, "user registered successfully");
};
