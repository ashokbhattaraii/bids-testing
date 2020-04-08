"use strict";

const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const RequestLinkSchema = mongoose.Schema(
  {
    request: { type: ObjectId, ref: "Request" },
    urlLink_id: String,
    url: String,
    duration: { type: Number, required: true, default: 24 },
    created_for: { type: ObjectId, ref: "User" },
    created_by: { type: ObjectId, ref: "User" },
    updated_by: { type: ObjectId, ref: "User" }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Request_Link", RequestLinkSchema);
