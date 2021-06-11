const mongoose = require("mongoose");
const moment = require("moment");
const PledgeModel = require("../donor/unverifiedDonor.model");
const { DataUtils } = require("../../utils");
const { RSUtils } = require("rumsan-core");

class Pledge {
  constructor() {}

  add(payload) {
    return PledgeModel.create(payload);
  }

  list({ isToday, start, limit, name, phone, address, group, gender }) {
    const query = [
      {
        $match: {
          request: {
            $ne: null
          }
        }
      }
    ];
    if (name) {
      query.push({
        $match: {
          name: { $regex: new RegExp(RSUtils.Text.escapeRegex(name), "gi") }
        }
      });
    }
    if (phone) {
      query.push({
        $match: {
          phone: { $regex: new RegExp(RSUtils.Text.escapeRegex(phone), "gi") }
        }
      });
    }
    if (address) {
      query.push({
        $match: {
          address: { $regex: new RegExp(RSUtils.Text.escapeRegex(address), "gi") }
        }
      });
    }
    if (group) {
      query.push({
        $match: {
          group: { $regex: new RegExp(RSUtils.Text.escapeRegex(group), "gi") }
        }
      });
    }
    if (gender) {
      query.push({
        $match: {
          gender: { $regex: new RegExp(RSUtils.Text.escapeRegex(gender), "gi") }
        }
      });
    }
    if (isToday) {
      const today = moment().startOf("day").format();
      const tomorrow = moment().add(1, "days").startOf("day").format();
      query.push({
        $match: {
          created_at: {
            $gte: new Date(today),
            $lt: new Date(tomorrow)
          }
        }
      });
    }

    return DataUtils.paging({
      start,
      limit,
      sort: { created_at: -1 },
      model: PledgeModel,
      query
    });
  }

  getById(id) {
    return PledgeModel.findOne(id);
  }

  update(id, payload) {
    return PledgeModel.findOneAndUpdate(id, payload);
  }

  remove(id) {
    return PledgeModel.findOneAndDelete(id);
  }
}

module.exports = new Pledge();
