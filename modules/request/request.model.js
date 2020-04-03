const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const Scheme = mongoose.Schema(
  {
    requester_name: String,
    requester_phone: { type: String, required: true },
    requester_email: String,
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
    request_type: String,
    status: {
      type: String,
      required: true,
      enum: ["new", "in-progress", "completed", "cancelled"]
    },
    expiry_url: { type: String },
    expiry_id: { type: ObjectId, ref: "Request_Link" },
    additional_donors: [{}],
    documents: [
      {
        _id: false,
        type: { type: String, required: true },
        location: { type: String, required: true },
        timestamp: { type: Date, required: true, default: Date.now }
      }
    ],
    request_donor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Request_Donor"
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Request", Scheme);
