const { Schema, model } = require("mongoose");

const permissionSchema = Schema(
  {
    role: {
      type: Schema.Types.ObjectId,
      ref: "roles",
      required: true,
    },
    moduleName: {
      type: String,
      required: true,
    },
    canEdit: {
      type: Boolean,
      default: false,
    },
    canDelete: {
      type: Boolean,
      default: false,
    },
    canView: {
      type: Boolean,
      default: false,
    },
    canRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = model("permissions", permissionSchema);
