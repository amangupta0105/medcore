const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, "Please use a valid phone number"],
    },
    role: {
      type: String,
      required: true,
      enum: ["patient", "admin", "doctor", "staff"],
      default: "patient",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    lastLogin :{
      type :Date
    }
  },
  { timestamps: true },
);

const User = mongoose.model("User", UserSchema);

module.exports = { User };
