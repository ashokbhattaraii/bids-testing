const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const DonorSchema = mongoose.Schema(
  {
    donor_id: { type: ObjectId, ref: "Donor" },
    source: {
      type: String,
      enum: ["Website", "Bot"]
    },
    status: {
      type: String,
      enum: ["accepted", "dormant","ineligible", "rejected", "do_not_call"]
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
