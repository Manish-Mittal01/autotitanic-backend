const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const { UserServices } = require("../../services/userServices");
const wishlistmodel = require("../../Models/wishlistmodel");

module.exports.addToWishlist = async (req, res) => {
  try {
    const { id } = req.body;
    const token = req.headers["x-access-token"];

    const isTokenValid = await UserServices.validateToken(token);
    // console.log("isTokenValid", isTokenValid);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

    const validationError = checkRequiredFields({ id });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isVehicleExist = await wishlistmodel.findOne({ vehicle: id, user: isTokenValid._id });
    if (isVehicleExist)
      return ResponseService.failed(res, "Vehicle already exist", StatusCode.forbidden);

    // const wishlistCount = await wishlistmodel.countDocuments({ user: isTokenValid._id });
    // if (wishList >= 21) {
    //   return ResponseService.failed(
    //     res,
    //     "You can only add up to 20 items in the list",
    //     StatusCode.forbidden
    //   );
    // }

    const newVehicle = { vehicle: id, user: isTokenValid._id };
    const addedVehicle = new wishlistmodel(newVehicle);
    const result = await addedVehicle.save();

    return ResponseService.success(res, `vehicle added successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.getWishlist = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.body;
    const token = req.headers["x-access-token"];

    const isTokenValid = await UserServices.validateToken(token);
    // console.log("isTokenValid", isTokenValid);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

    const wishlist = await wishlistmodel
      .find({ user: isTokenValid._id })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "user vehicle",
        populate: {
          path: "make model city country user",
          // path: "make model variant city country user",
          strictPopulate: false,
        },
      });

    const wishlistCount = await wishlistmodel.countDocuments({ user: isTokenValid._id });

    return ResponseService.success(res, "Vehicle details found", {
      items: wishlist,
      totalCount: wishlistCount,
    });
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};

module.exports.removewishlistItem = async (req, res) => {
  try {
    const { id } = req.body;
    const token = req.headers["x-access-token"];

    const isTokenValid = await UserServices.validateToken(token);
    // console.log("isTokenValid", isTokenValid);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

    if (!id) return ResponseService.failed(res, "Id is required", StatusCode.badRequest);

    const isVehicleExist = await wishlistmodel.findOne({ _id: id });

    if (!isVehicleExist)
      return ResponseService.failed(res, "Vehicle not found", StatusCode.notFound);

    const result = await wishlistmodel.deleteOne({
      _id: id,
    });

    return ResponseService.success(res, "Vehicle removed from wishlist", result);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};
