const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const DonorSchema = mongoose.Schema(
  {
    donor_id: { type: ObjectId, ref: "Donor" },
    last_request_date: Date,
    source: {
      type: String,
      enum: ["Website", "Bot"]
    },
    notes: [
      {
        date: { type: Date, required: true, default: Date.now },
        dispatch: { type: ObjectId, ref: "Request" },
        type: {
          type: String,
          enum: ["note", "call_received", "call_made", "email", "sms"],
          default: "note"
        },
        text: { type: String, required: true },
        rating: Number,
        status: String,
        user: { type: ObjectId, ref: "User" }
      }
    ],
    status: {
      type: String,
      required: true,
      enum: ["active", "dormant", "inactive", "do_not_call"]
    },
    status_note: String,
    created_by: { type: ObjectId, ref: "User" },
    updated_by: { type: ObjectId, ref: "User" }
  },
  {
    collection: "donors_history",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

module.exports = mongoose.model("DonorPlus", DonorSchema);
