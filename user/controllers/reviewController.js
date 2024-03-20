const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const { UserServices } = require("../../services/userServices");
const reviewModel = require("../../Models/reviewModel");
const { Types } = require("mongoose");

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
    const { seller, sortBy, order, pagination = {} } = req.body;
    const { limit = 10, page = 1 } = pagination;

    const reviews = await reviewModel.aggregate([
      {
        $match: { seller: Types.ObjectId(seller) },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "users",
          localField: "seller",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: "$seller" },
      {
        $lookup: {
          from: "countries",
          localField: "user.country",
          foreignField: "_id",
          as: "user.country",
        },
      },
      { $unwind: "$user.country" },
      {
        $addFields: {
          likesCount: {
            $cond: [{ $isArray: "$likes" }, { $size: "$likes" }, 0],
          },
          dislikesCount: {
            $cond: [{ $isArray: "$dislikes" }, { $size: "$dislikes" }, 0],
          },
          repliesCount: {
            $cond: [{ $isArray: "$replies" }, { $size: "$replies" }, 0],
          },
        },
      },
      { $project: { likes: 0, dislikes: 0, replies: 0 } },
      { $sort: sortBy ? { [sortBy]: order } : { _id: 1 } },
      { $skip: (Number(page) - 1) * limit },
      { $limit: limit },
    ]);

    const reviewsCount = await reviewModel.countDocuments({ seller });
    let rating = (
      reviews.reduce((acc, curr) => acc + Number(curr.rating), 0) / reviews.length || 0
    ).toFixed(1);

    const ratingType =
      rating <= 1
        ? "Poor"
        : rating <= 2
        ? "Not Bad"
        : rating <= 3
        ? "Fair"
        : rating <= 4
        ? "Good"
        : "Excellent";

    const data = {
      rating: rating,
      items: reviews,
      totalCount: reviewsCount,
      ratingType: ratingType,
    };

    return ResponseService.success(res, "Reviews list found", data);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};

module.exports.manageLikes = async (req, res) => {
  try {
    const { reviewId, action } = req.body;

    const token = req.headers["x-access-token"];
    const isTokenValid = await UserServices.validateToken(token);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);
    const user = isTokenValid._id;

    const validationError = checkRequiredFields({ reviewId, user, action });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    if (action !== "like" && action !== "dislike")
      return ResponseService.failed(res, "invalid action", StatusCode.badRequest);

    const isReviewExist = await reviewModel.findOne({ _id: reviewId });
    if (!isReviewExist)
      return ResponseService.failed(res, "invalid reviewId", StatusCode.badRequest);

    const isResponseExist = await reviewModel.findOne({
      _id: reviewId,
      $or: [{ "likes.user": user }, { "dislikes.user": user }],
    });

    let result = {};
    if (isResponseExist) {
      await reviewModel.updateOne(
        { _id: reviewId },
        {
          $pull: {
            likes: { user: user },
            dislikes: { user: user },
          },
        }
      );

      result = await reviewModel.updateOne(
        { _id: reviewId },
        { $push: action === "like" ? { likes: { user } } : { dislikes: { user } } }
      );
    } else {
      result = await reviewModel.updateOne(
        { _id: reviewId },
        { $push: action === "like" ? { likes: { user } } : { dislikes: { user } } }
      );
    }

    return ResponseService.success(res, "like updated", result);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, error?.message || error, StatusCode.serverError);
  }
};

module.exports.addReply = async (req, res) => {
  try {
    const { reviewId, reply } = req.body;

    const token = req.headers["x-access-token"];
    const isTokenValid = await UserServices.validateToken(token);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);
    const user = isTokenValid._id;

    const validationError = checkRequiredFields({ reviewId, user, reply });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isReviewExist = await reviewModel.findOne({ _id: reviewId });
    if (!isReviewExist) {
      return ResponseService.failed(res, "Review not found", StatusCode.badRequest);
    }

    const result = await reviewModel.updateOne(
      { _id: reviewId },
      { $push: { replies: { user, reply, createdAt: new Date() } } }
    );

    return ResponseService.success(res, `Reply added successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error?.message || error, 400);
  }
};

module.exports.getAllReply = async (req, res) => {
  try {
    const { reviewId, pagination = {} } = req.body;
    const { limit = 10, page = 1 } = pagination;

    const validationError = checkRequiredFields({ reviewId });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isReviewExist = await reviewModel.findOne({ _id: reviewId });
    if (!isReviewExist)
      return ResponseService.failed(res, "Review not found", StatusCode.badRequest);

    const myData = await reviewModel.aggregate([
      {
        $match: {
          _id: Types.ObjectId(reviewId),
        },
      },
      {
        $project: {
          replies: {
            $slice: ["$replies", limit * (page - 1), limit],
          },
        },
      },
      { $unwind: "$replies" },
      {
        $lookup: {
          from: "users",
          localField: "replies.user",
          foreignField: "_id",
          as: "replies.user",
        },
      },
      { $unwind: "$replies.user" },
      {
        $lookup: {
          from: "countries",
          localField: "replies.user.country",
          foreignField: "_id",
          as: "replies.user.country",
        },
      },
      { $unwind: "$replies.user.country" },
      {
        $group: {
          _id: "$_id",
          replies: { $push: "$replies" },
        },
      },
    ]);

    const response = {
      items: myData[0]?.replies || [],
    };

    return ResponseService.success(res, "User added", response);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, error?.message || error, StatusCode.serverError);
  }
};
