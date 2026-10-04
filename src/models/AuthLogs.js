import mongoose from "mongoose";

const authLogsSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    eventType: {
      type: String,
      enum: [
        "registration_succeeded",
        "login_succeeded",
        "login_failed",
        "logout_succeeded",
        "password_changed",
        "account_locked",
      ],
      required: true,
      index: true,
    },
    details: {
      ipAddress: { type: String },
      reason: {
        type: String,
        enum: [
          "invalid_credentials",
          "too_many_failed_attempts",
          "user_initiated",
          "administrator_action",
        ],
      },
    },
  },
  {
    versionKey: false,
  },
);

export const AuthLogs = mongoose.model("AuthLogs", authLogsSchema);
