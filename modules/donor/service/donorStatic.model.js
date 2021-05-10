const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const DonorSchema = mongoose.Schema(
  {
    donor_no: { type: String },
    user_id: { type: ObjectId, ref: "User" },
    name: { type: String, required: true },
    phone: { type: String, required: true }, //TODO unique: true
    event: { type: ObjectId, ref: "Event" },
    email: { type: String },
    address: { type: String },
    dob: { type: Date },
    dob_np: { type: Date },
    gender: { type: String, required: true, enum: ["M", "F", "O"] },
    blood_info: {
      group: { type: String, enum: ["A", "B", "O", "AB", ""] },
      rh_factor: { type: String, enum: ["+", "-"] },
      is_verified: { type: Boolean, required: true, default: false },
      verified_date: { type: Date },
      verified_by: { type: ObjectId, ref: "Organization" }
    },
    last_donated_date: { type: Date },
    donations: [
      {
        event: { type: ObjectId, ref: "Event" },
        investigations: {}
      }
    ],
    donations_legacy: [{ type: Date }],
    geo_location: {
      longitude: Number,
      latitude: Number
    },
    source: {
      name: String,
      id: String
    },
    notes: [{ note: String, date: Date, user: ObjectId }],
    devs: {},
    teams: [{ type: ObjectId, ref: "Team" }],
    misc: {},
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

module.exports = mongoose.model("DonorStatic", DonorSchema);
