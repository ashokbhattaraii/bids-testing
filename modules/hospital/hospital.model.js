const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const Scheme = mongoose.Schema(
  {
    requester_name: String,
    requester_phone: { type: String, required: true },
    address: String,
    patient_name: { type: String, required: true },
    hospital: String,
    blood_group: { type: String, required: true, enum: ["A", "B", "O", "AB", ""] },
    rh_factor: { type: String, required: true, enum: ["+", "-"] },
    source: { type: String, default: "website" },
    requested_date: Date,
    requested_products: [
      {
        _id: false,
        blood_type: {
          type: String,
          required: true,
          enum: ["WB", "PRP", "PRBC", "FFP", "CRY", "PC"]
        },
        quantity: { type: Number, required: true, default: 1 }
      }
    ],
    diagnosis: String,
    tags: [String],
    remarks: String,
    referred_by: String,
    status: {
      type: String,
      required: true,
      enum: ["new", "in-progress", "completed", "cancelled"]
    },
    documents: [
      {
        _id: false,
        type: { type: String, required: true },
        location: { type: String, required: true },
        timestamp: { type: Date, required: true, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Hospital", Scheme);
