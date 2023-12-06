const { Schema, model } = require("mongoose");

const userAvatarSchema = Schema(
    {
        userId: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
        }
    },
    { timestamps: true, versionKey: false }
);

module.exports = model("userAvatars", userAvatarSchema);
