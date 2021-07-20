const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const Scheme = mongoose.Schema(
  {
    requester_name: String,
    requester_phone: { type: String, required: true },
    requester_email: String,
    patient_name: { type: String, required: true },
    patient_feedback: {
      status: {
        type: String,
        required: true,
        enum: ["received", "pending", "!contacted"],
        default: "!contacted"
      },
      remarks: { type: String },
      email: { type: String },
      is_verified: { type: Boolean, default: false }
    },
    hospital: String,
    hospital_address: { type: String, required: true },
    urgency: {
      type: String,
      required: true,
      enum: ["urgent", "moderate", "!urgent"],
      default: "moderate"
    },
    blood_group: { type: String, required: true, enum: ["A", "B", "O", "AB", ""] },
    rh_factor: { type: String, required: true, enum: ["+", "-"] },
    source: { type: String, default: "website" },
    requested_date: Date,
    request_managed_from: {
      type: String,
      enum: ["BloodBank", "Donor", "Both", "Themselves", "Others"]
    },
    total_pints_blood: { type: Number },
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
    managed_products: [
      {
        _id: false,
        blood_type: {
          type: String,
          enum: ["WB", "PRP", "PRBC", "FFP", "CRY", "PC"]
        },
        quantity: { type: Number },
        manager: { type: String }
      }
    ],
    diagnosis: { type: ObjectId, ref: "Diagnosis" },
    tags: [String],
    remarks: String,
    referred_by: String,
    request_type: String,
    request_handled_by: String,
    requisition_file_url: String,
    transportation_required: { type: String, enum: ["yes", "no"], required: true, default: "no" },
    status: {
      type: String,
      required: true,
      enum: ["new", "in-progress", "managed", "pending", "completed", "cancelled"]
    },
    expiry_url: { type: String },
    expiry_id: { type: ObjectId, ref: "Request_Link" },
    additional_donors: [
      {
        _id: false,
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        created_by_name: String,
        created_by: { type: ObjectId, ref: "User" }
      }
    ],
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
