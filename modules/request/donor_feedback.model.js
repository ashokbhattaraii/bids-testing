const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const DonorFeedackSchema = mongoose.Schema(
  {
    request: { type: ObjectId, ref: "Request" },
    donor: { type: ObjectId, ref: "Donor" },
    status:{ type: String, enum: ["donated", "!donated", "rejected"]},
    remarks: { type:String } 
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Request_Donor_Feedback", DonorFeedackSchema);
