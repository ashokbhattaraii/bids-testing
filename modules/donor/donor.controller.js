const mongoose = require("mongoose");
const _ = require("lodash");
const moment = require("moment");
const { ObjectId } = require("mongoose").Types;

const DonorService = require("./service");
const DonorModel = require("./donor.model");
const { TextUtils, ERR, DataUtils } = require("../../utils");

const splitBloodInfo = blood_info => {
  let rh_factor = blood_info.match(/\+|-/);
  rh_factor = rh_factor[0].toString();
  let group = blood_info.replace(/\+|-/, "");
  return (blood_info = {
    group: group,
    rh_factor: rh_factor
  });
};

class Donors {
  constructor() {}

  async get(id) {
    let donorId = ObjectId(id);
    return DonorModel.find({ donor_id: `${donorId}` });
  }

  getByPhone(phone) {
    return DonorService.getByPhone({ phone: phone });
  }

  list({ limit, start, group, phone, name, address }) {
    return DonorService.list({ limit, start, group, phone, name, address });
  }

  listDonorHistory(limit, start, id) {
    return DonorService.donorHistoryList(limit, start, id);
  }

  dispatch(group, address, name, donorids, limit, start) {
    return DonorService.findEligibleDonors(group, address, name, donorids, limit, start);
  }

  save(disPatchId, payload) {
    return DonorModel.findOneAndUpdate(
      { donor_id: payload.donor_id },
      {
        $push: {
          notes: {
            type: payload.comm_type,
            text: payload.comments,
            dispatch: disPatchId,
            rating: payload.rating,
            status: payload.status + ":" + payload.status_note
          }
        },
        $set: {
          rating: payload.rating,
          status: payload.status,
          status_note: payload.status_note ? payload.status_note : "",
          last_request_date: payload.last_request_date
        }
      },
      { upsert: true, new: true }
    );
  }
}

module.exports = new Donors();
