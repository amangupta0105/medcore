const mongoose = require("mongoose");

const DoctorSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      min: 0,
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
    },
    qualifications: {
      type: [String],
    },
    consultationsToday: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableDays: {
      type: [String],
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    availableFrom: {
      type: String,
    },
    availableTo: {
      type: String,
    },
  },
  { timestamps: true },
);

const Doctor = mongoose.model("Doctor", DoctorSchema);

module.exports = { Doctor };
