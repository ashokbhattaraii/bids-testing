"use strict";

const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const DonorSchema = mongoose.Schema(
  {
    request: { type: ObjectId, ref: "Request" },
    donor: { type: ObjectId, ref: "Donor" }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Request_Donor", DonorSchema);
