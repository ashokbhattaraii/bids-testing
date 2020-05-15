const mongoose = require("mongoose");
const _ = require("lodash");
const moment = require("moment");
const { ObjectId } = require("mongoose").Types;

const DonorService = require("./service");
const DonorModel = require("./donor.model");
const UnverifeidDonorModel = require("./unverifiedDonor.model");
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
  constructor(options) {
    this.options = options;
  }

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
          created_by: payload.created_by,
          updated_by: payload.updated_by,
          status_note: payload.status_note ? payload.status_note : "",
          last_request_date: payload.last_request_date
        }
      },
      { upsert: true, new: true }
    );
  }

  unverifiedList({ limit, start, group, phone, name, address, source }) {
    console.log("%%%%%%%%%%%%%% i am here biaaaaaaaaatch");
    let page = parseInt(start) / parseInt(limit) + 1;
    let query = {};
    if (group)
      query = {
        blood_group: group
      };
    else if (phone) {
      const regex = new RegExp(TextUtils.escapeRegex(phone), "gi");
      query = {
        phone: {
          $regex: regex
        }
      };
    } else if (name) {
      const regex = new RegExp(TextUtils.escapeRegex(name), "gi");
      query = {
        name: {
          $regex: regex
        }
      };
    } else if (address) {
      const regex = new RegExp(TextUtils.escapeRegex(address), "gi");
      query = {
        address: {
          $regex: regex
        }
      };
    } else if (source) {
      const regex = new RegExp(TextUtils.escapeRegex(source), "gi");
      query = {
        "source.name": {
          $regex: regex
        }
      };
    }
    return new Promise((resolve, reject) => {
      UnverifeidDonorModel.aggregate([
        {
          $facet: {
            data: [
              {
                $project: {
                  name: 1,
                  phone: 1,
                  gender: 1,
                  dob: 1,
                  address: 1,
                  blood_group: 1,
                  is_verified: 1,
                  agree_to_donate: 1,
                  updated_at: 1,
                  created_at: 1,
                  "source.name": 1
                }
              },
              {
                $match: query
              },
              {
                $sort: {
                  name: 1
                }
              },
              {
                $skip: start
              },
              {
                $limit: limit
              }
            ],
            summary: [
              {
                $group: {
                  _id: null,
                  count: {
                    $sum: 1
                  }
                }
              }
            ]
          }
        }
      ])
        .then(d => {
          console.log("************* this the d", d);
          if (d[0].summary.length > 0)
            resolve({
              total: d[0].summary[0].count,
              limit,
              start,
              page,
              data: d[0].data
            });
          else
            resolve({
              total: 0,
              limit,
              start,
              page,
              data: []
            });
        })
        .catch(e => reject(e));
    });
  }

  saveUnverified(payload) {
    if (payload.id) return this.updateUnverifiedDonor(payload.id, payload);
    else return UnverifeidDonorModel.create(payload);
  }

  editUnverifiedStatus(payload, id) {
    return UnverifeidDonorModel.findByIdAndUpdate(
      id,
      { $set: { is_verified: payload.is_verified } },
      { upsert: true, new: true }
    );
  }

  async updateUnverifiedDonor(id, payload) {
    return UnverifeidDonorModel.findOneAndUpdate({ _id: id }, { $set: payload }, { new: true });
  }

  getUnverifiedDonor(donorId) {
    return UnverifeidDonorModel.findById(donorId);
  }

  removeUnverifiedDonor(donorId) {
    return new Promise((resolve, reject) => {
      UnverifeidDonorModel.remove({
        _id: donorId
      })
        .then(d => resolve(d))
        .catch(e => reject(e));
    });
  }

  async getReports(date, endDate) {
    if (date || endDate) {
      return await UnverifeidDonorModel.find({
        $and: [
          {
            is_verified: true
          },
          {
            updated_at: {
              $gte: date,
              $lte: new Date()
            }
          }
        ]
      }).sort({ name: "asc" });
    } else {
      return await UnverifeidDonorModel.find({
        is_verified: true
      }).sort({ name: "asc" });
    }
  }
}

module.exports = new Donors();
