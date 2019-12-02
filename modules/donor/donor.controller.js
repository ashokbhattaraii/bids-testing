const mongoose = require("mongoose");
const _ = require("lodash");
const moment = require("moment");
const { ObjectId } = require("mongoose").Types;

const DonorService = require("./service");
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

  async get(donorId) {
    return DonorService.get(donorId);
  }

  getByPhone(phone) {
    return DonorService.getByPhone({ phone: phone });
  }

  list({ limit, start, group, phone, name, address }) {
    return DonorService.list({ limit, start, group, phone, name, address });
  }

  dispatch(group, address, name, donorids, limit, start) {
    return DonorService.findEligibleDonors(group, address, name, donorids, limit, start);
  }
}

module.exports = new Donors();
