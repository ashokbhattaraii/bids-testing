"use strict";

const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const DiagnosisSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    count: { type: Number, default: 1 },
    is_active: { type: Boolean, default: true },
    created_by: { type: ObjectId, ref: "User" },
    last_updated_by: { type: ObjectId, ref: "User" }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Diagnosis", DiagnosisSchema);
