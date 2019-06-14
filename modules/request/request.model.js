const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const DonorSchema = mongoose.Schema(
  {
    requester_name: String,
    requester_phone: String,
    address: String,
    patient_name: String,
    hospital: String,
    blood_group: { type: String, enum: ["A", "B", "O", "AB", ""] },
    rh_factor: { type: String, enum: ["+", "-"] },
    source: { type: String, default: "website" }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Request", DonorSchema);
