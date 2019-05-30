const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const DonorSchema = mongoose.Schema(
  {
    request_name: String,
    request_phone: String,
    patient_name: String,
    hospital: { name: String, id: String },
    blood_group: { type: String, enum: ["A", "B", "O", "AB", ""] },
    rh_factor: { type: String, enum: ["+", "-"] },
    donors: [ObjectId]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Request", DonorSchema);
