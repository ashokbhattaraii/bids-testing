const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const UnverifiedDonorSchema = mongoose.Schema(
  {
    donor_no: { type: String },
    user_id: { type: ObjectId, ref: "User" },
    name: { type: String, required: true },
    phone: { type: String, required: true }, //TODO unique: true
    email: { type: String },
    address: { type: String },
    dob: { type: Date },
    weight: { type: String },
    gender: { type: String, required: true, enum: ["M", "F", "O"] },
    agree_to_donate: {
      type: String,
      enum: ["yes", "no", ""],
      default: ""
    },
    blood_group: {
      type: String,
      enum: ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-", ""]
    },
    source: {
      name: String,
      id: String
    },
    notes: { type: String },
    is_verified: { type: Boolean, required: true, default: false },
    created_by: { type: ObjectId, ref: "User" },
    updated_by: { type: ObjectId, ref: "User" }
  },
  {
    collection: "unverified_donors",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

module.exports = mongoose.model("UnverifiedDonor", UnverifiedDonorSchema);
