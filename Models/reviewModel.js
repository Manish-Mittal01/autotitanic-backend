const { Schema, model, Types } = require("mongoose");

const reviewSchema = Schema(
  {
    user: {
      type: Types.ObjectId,
      required: true,
      ref: "users",
    },
    seller: {
      type: Types.ObjectId,
      required: true,
      ref: "users",
    },
    rating: {
      type: String,
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
    likes: {
      type: [{ user: Types.ObjectId }],
    },
    dislikes: {
      type: [{ user: Types.ObjectId }],
    },
    replies: {
      type: [
        {
          user: { type: Types.ObjectId, ref: "users", required: true },
          reply: { type: String, required: true },
          createdAt: { type: Date },
          likes: { type: [{ user: Types.ObjectId }], default: [] },
          dislikes: { type: [{ user: Types.ObjectId }], default: [] },
        },
      ],
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("review", reviewSchema);
