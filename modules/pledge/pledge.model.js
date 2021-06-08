const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const Scheme = mongoose.Schema(
  {
    name: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    requestId: { type: ObjectId, ref: "Request" }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Pledge", Scheme);
