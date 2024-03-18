const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const { UserServices } = require("../../services/userServices");
const wishlistmodel = require("../../Models/wishlistmodel");
const reviewModel = require("../../Models/reviewModel");

module.exports.addReview = async (req, res) => {
  try {
    const { seller, rating, review } = req.body;
    const token = req.headers["x-access-token"];

    const isTokenValid = await UserServices.validateToken(token);
    // console.log("isTokenValid", isTokenValid);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

    const validationError = checkRequiredFields({ seller, rating, review });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isReviewExist = await reviewModel.findOne({ user: isTokenValid._id, seller });
    if (isReviewExist)
      return ResponseService.failed(
        res,
        "Already added a review for this seller",
        StatusCode.forbidden
      );

    const newReview = { user: isTokenValid._id, seller, rating, review };
    const validReview = new reviewModel(newReview);
    const result = await validReview.save();

    return ResponseService.success(res, `Review submitted successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error?.message || error, 400);
  }
};

module.exports.getReviews = async (req, res) => {
  try {
    const { seller } = req.body;
    const token = req.headers["x-access-token"];

    const isTokenValid = await UserServices.validateToken(token);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

    const reviews = await reviewModel.find({ seller }).populate("user").lean();

    return ResponseService.success(res, "Vehicle details found", reviews);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};
