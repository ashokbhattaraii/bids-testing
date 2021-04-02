const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const DonorRatingSchema = mongoose.Schema(
  {
    donor_id: { type: ObjectId, ref: "Donor" }, 
    request_id: { type: ObjectId, ref: "Request" },
    rating: { type: Number, required: true },
    communication_type: {
      type: String,
      enum: ["note", "call_received", "call_made", "email", "sms"],
      default: "note"
    },
    remarks:{ type : String },
    extras:{},
    created_by: { type: ObjectId, ref: "User" },
    updated_by: { type: ObjectId, ref: "User" }
  },
  {
    collection: "donor_rating",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

module.exports = mongoose.model("DonorRating", DonorRatingSchema);
