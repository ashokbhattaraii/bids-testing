const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const DonorSchema = mongoose.Schema(
  {
    _id: false,
    phone: { type: String, required: true },
    source: {
      type: String,
      enum: ["website", "bot"]
    },
    rate: Number,
    comments: String,
    notes: [
      {
        note: String,
        date: Date,
        user: ObjectId
      }
    ],
    created_by: { type: ObjectId, ref: "User" },
    updated_by: { type: ObjectId, ref: "User" }
  },
  {
    collection: "donors",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

module.exports = mongoose.model("Donor", DonorSchema);
