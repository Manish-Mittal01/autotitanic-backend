const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const { UserServices } = require("../../services/userServices");
const reviewModel = require("../../Models/reviewModel");
const { Types } = require("mongoose");
const UserModel = require("../../Models/UserModel");
const { transporter } = require("../../firebaseConfig");

module.exports.addReview = async (req, res) => {
  try {
    const { seller, rating, review } = req.body;
    const token = req.headers["x-access-token"];

    const isTokenValid = await UserServices.validateToken(token);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

    const validationError = checkRequiredFields({ seller, rating, review });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const user = await UserModel.findOne({ _id: isTokenValid._id }).lean();

    const isSellerExist = await UserModel.findOne({ _id: seller }).lean();
    if (!isSellerExist)
      return ResponseService.failed(res, "Seller not exist", StatusCode.badRequest);

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

    const mailOptions = {
      from: "Manish Mittal <no-reply@manishmittal.tech>",
      to: isSellerExist.email,
      subject: "New Review",
      html: `<p style="font-size: 16px;">
      Hey ${isSellerExist.name},
      <br/><br/>
      You have received a new Review from ${user.name}
      <br/><br/>
      Please Visit <a href="autotitanic.com">autotitanic.com</a> to view and respond as necessary.
      <br/><br/>
      Kind regards,
      <br/><br/>
      Autotitanic.com
      </p>`,
    };

    transporter.sendMail(mailOptions, async (erro, info) => {
      if (erro) {
        console.log("mail error", erro);
        return ResponseService.serverError(res, erro);
      }
      return ResponseService.success(res, "Review submitted successfully", result);
    });

    // return ResponseService.success(res, `Review submitted successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.serverError(res, error, 400);
  }
};

module.exports.getReviews = async (req, res) => {
  try {
    const { seller, user, sortBy = "_id", order = -1, limit = 10, page = 1 } = req.body;

    const queryObj = {};
    if (seller) {
      queryObj.seller = Types.ObjectId(seller);
    }
    if (user) {
      queryObj.user = Types.ObjectId(user);
    }

    const reviews = await reviewModel.aggregate([
      {
        $match: queryObj,
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
      { $sort: { [sortBy]: order } },
      { $skip: (Number(page) - 1) * limit },
      { $limit: limit },
    ]);

    const reviewsCount = await reviewModel.countDocuments({ ...queryObj });
    let rating = (
      reviews.reduce((acc, curr) => acc + Number(curr.rating), 0) / reviews.length || 0
    ).toFixed(1);

    const ratingType =
      rating.toString() === "0.0"
        ? "No reviews yet"
        : rating <= 1.5
        ? "Poor"
        : rating <= 2.5
        ? "Fair"
        : rating <= 3.5
        ? "Good"
        : rating <= 4.5
        ? "Very Good"
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

module.exports.manageLikesOnreply = async (req, res) => {
  try {
    const { replyId, action } = req.body;

    const token = req.headers["x-access-token"];
    const isTokenValid = await UserServices.validateToken(token);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);
    const user = isTokenValid._id;

    const validationError = checkRequiredFields({ replyId, user, action });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    if (action !== "like" && action !== "dislike")
      return ResponseService.failed(res, "invalid action", StatusCode.badRequest);

    const isReplyExist = await reviewModel.findOne({ "replies._id": replyId });
    if (!isReplyExist) return ResponseService.failed(res, "invalid replyId", StatusCode.badRequest);

    const isResponseExist = await reviewModel.findOne({
      "replies._id": replyId,
      $or: [{ "replies.likes.user": user }, { "replies.dislikes.user": user }],
    });

    if (isResponseExist) {
      await reviewModel.updateOne(
        { "replies._id": replyId },
        {
          $pull: {
            "replies.$.likes": { user: user },
            "replies.$.dislikes": { user: user },
          },
        }
      );
    }

    const result = await reviewModel.updateOne(
      { "replies._id": replyId },
      {
        $push:
          action === "like" ? { "replies.$.likes": { user } } : { "replies.$.dislikes": { user } },
      }
    );

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

      //pagination
      // {
      //   $project: {
      //     replies: {
      //       $slice: ["$replies", limit * (page - 1), limit],
      //     },
      //   },
      // },
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
        $addFields: {
          "replies.likesCount": {
            $cond: [{ $isArray: "$replies.likes" }, { $size: "$replies.likes" }, 0],
          },
          "replies.dislikesCount": {
            $cond: [{ $isArray: "$replies.dislikes" }, { $size: "$replies.dislikes" }, 0],
          },
        },
      },
      {
        $project: {
          "replies.likes": 0,
          "replies.dislikes": 0,
        },
      },
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

    return ResponseService.success(res, "Reply list found", response);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, error?.message || error, StatusCode.serverError);
  }
};
